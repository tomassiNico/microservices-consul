const express = require('express');
const os = require('os');
const consul = require('consul')();
const uuid = require('uuid');


const PID = process.pid;
const PORT = Math.floor(process.argv[2]);
const HOST = os.hostname();
const CONSUL_ID = `animals-${HOST}-${PORT}-${uuid.v4()}`;

const app = express();

const animals = [
    {
        id: 1,
        name: 'tigre'
    },
    {
        id: 2,
        name: 'elefante'
    },
    {
        id: 3,
        name: 'pinguino'
    },
    {
        id: 4,
        name: 'pato'
    },
    {
        id: 5,
        name: 'gato'
    },
    {
        id: 6,
        name: 'hormiga'
    },
];

app.get('/animals', (req, res) => {
    console.log('GET /animals ', Date.now());
    res.send(animals);
});

app.get('/animals/:id', (req, res) => {
    console.log('GET /animals/' + req.params.id + ' ', Date.now());
    const animal = animals.find(animal => animal.id == req.params.id);
    if(!animal){
        res.status(404).send({message: "Animal no encontrado"})
        return;
    }
    res.send({animal})
});


app.listen(PORT, ()=> {
    let details = {
        name: 'animals-service',
        address: HOST,
        check: {
            ttl: '100s',
            deregister_critical_service_after: '1m'
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
                if(err) throw new Error(err);
                console.log('Enviando aviso de salud a Consul');
            });
        }, 5*1000);

        process.on('SIGINT', () => {
            console.log('SIGNIT. Des-registrandose de Consul');
            let details = { id: CONSUL_ID};
            consul.agent.service.deregister(details, err => {
                console.log('Des-registrandose', err);
                process.exit();
            })
        })
    })

    console.log('Servidor corriendo en http://' + HOST + ':' + PORT);
});