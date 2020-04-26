const express = require('express');
const consul = require('consul')();
const uuid = require('uuid');
const request = require('request');
const os = require('os');

const PID = process.pid;
const PORT = Math.floor(process.argv[2]);
const HOST = os.hostname();
const CONSUL_ID = `foods-${HOST}-${PORT}-${uuid.v4()}`;

const app = express();

let animals_service_instances = []; // Array con las URL de las instancias del servicio de animales

const foods = [
    {
        id: 1,
        name: "granos",
        animals: [4, 6]
    },
    {
        id: 2,
        name: "carne",
        animals: [1, 3, 4, 5, 6]
    },
    {
        id: 3,
        name: "plantas",
        animals: [2, 5, 6]
    },
    {
        id: 4,
        name: "alimento balanceado",
        animals: [5]
    },
];

app.get('/', (req, res) => {
    console.log('GET / ', Date.now());
    res.send({
        message: 'Bienvenido al servicio de comidas y animales que las consumen.',
        endpoints: [
            {
                endpoint: '/foods',
                description: 'Obtener lista de alimentos y animales que los consumen'
            },
            {
                endpoint: '/foods/:id',
                description: 'Obtener el detalle de un alimento y descripcion de los animales que lo consumen'
            }
        ]
    });
});

app.get('/foods', (req, res) => {
    console.log('GET /foods ', Date.now());
    res.send(foods);
});

const fetchDataAnimals = async () => {
    return new Promise((res, rej) => {
        const url = animals_service_instances[Math.floor(Math.random()*animals_service_instances.length)];
        console.log('Pidiendo datos de animales a ', url);
        request(url, {json:true}, (err, response, data) => {
            if(err){
                rej(err);
            };
            res(data);
        })
    })
}

app.get('/foods/:id', async (req, res) => {
    try{
        console.log(`GET /foods/${req.params.id} `, Date.now());
        let food = foods.find(food => food.id == req.params.id);
        food = Object.assign({}, food); // se realiza copia para no perder la referencia de los animales
        if(!food){
            res.status(404).send({message: "Alimento no encontrado"});
            return;
        }
        
        const animals = await fetchDataAnimals();
        food.animals = animals.filter(animal => food.animals.includes(animal.id));

        res.send({food});
    }catch(err){
        res.status(500).send({error: true, message: err});
    }
});

app.listen(PORT, () => {
    let details = {
        name: 'food-service',
        address: HOST,
        check: {
            ttl: '100s',
            deregister_critical_service_after:'1m'
        },
        port: PORT,
        id: CONSUL_ID
    };

    console.log(`PID: ${PID} - PORT, ${PORT}, ID: ${CONSUL_ID}`);

    consul.agent.service.register(details, err => {
        if(err){
            throw new Error(err);
        }

        console.log('Registrandose con Consul');

        setInterval(() => {
            consul.agent.check.pass({id: `service:${CONSUL_ID}`}, err => {
                if(err){
                    throw new Error(err);
                }
                console.log('Enviando aviso de salud a Consul');
            });
        }, 5*1000)

        process.on('SIGINT', () => {
            console.log('SIGNIT. Des-registrandose de Consul');
            let details = { id: CONSUL_ID};
            consul.agent.service.deregister(details, err => {
                console.log('Des-registrandose', err);
                process.exit();
            })
        });
    });

    console.log('Servidor corriendo en http://' + HOST + ':' + PORT);
});

// Watcher de instancias de servicio de animales

const watcher = consul.watch({
    method: consul.health.service,
    options: {
        service: 'animals-service',
        passing: true
    }
});

watcher.on('change', instances => {
    console.log('Recibiendo actualizacion de Consul sobre la cantidad de instancia de servicio de animales: ', instances.length);
    animals_service_instances = [];

    instances.forEach(instance => {
        animals_service_instances.push(`http://${instance.Service.Address}:${instance.Service.Port}/animals`);
    });
});

watcher.on('error', err => {
    console.log('Watcher error: ', err);
});