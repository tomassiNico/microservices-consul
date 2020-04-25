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
        id: 3,
        name: "alimento balanceado",
        animals: [5]
    },
];

app.get('/', (req, res) => {
    console.log('GET / ', Date.now());
    res.send({
        message: 'Bienvenido al servicio de comidas y animales que las consumen.',
        endpoints: [
            '/foods',
            '/foods/:id',
            '/foods/:id/animals',
            '/foods/animals/:id',
        ]
    });
});

app.get('/foods', (req, res) => {
    console.log('GET /foods ', Date.now());
    res.send(foods);
});

app.get('/foods/:id', (req, res) => {
    console.log(`GET /foods/${req.params.id} `, Date.now());
    const food = foods.find(food => food.id == req.params.id);
    if(!food){
        res.status(404).send({message: "Alimento no encontrado"});
        return;
    }
    res.send({food});
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
})