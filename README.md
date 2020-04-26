# Aplicacion con microservicios  y Consul

Aplicacion construida con microservicios y usando Consul para el registro de instancias microservicios y consumir la mismas dinamicamente a utilizando [Consul](https://www.consul.io/) como Discovery Service.

## Herramientas necesarias para utilizarlo

* NodeJS con Express
* Consul
* Consul Client
* Docker

Para poder ejecutar este proyecto de manera local necesitaras de [Docker](https://www.docker.com/) y [NodeJS](https://nodejs.org/)

## Como utilizarlo
1.  Deberas iniciar un servidor [Consul](https://www.consul.io/). Ejecuta los siguientes comandos para levantar una instancia en docker

```
docker pull consul

docker run -d -p 8500:8500 -p 8600:8600/udp --name=badger consul agent -server -ui -node=server-1 -bootstrap-expect -client=0.0.0.0
```

2.  Valida que tu servidor de Consul haya iniciado ingresando al siguiente url ``` http://localhost:8500/ ``` deberas ver la interfaz de Consul

![Consul Server](https://github.com/tomassiNico/microservices-consul/images/consul-server-ui.png)

3. Dirigete al directorio del servicio de animales y ejecuta una instancia del mismo
```
cd <RUTADELREPO>/microservice-consul/animals-service

node server.js <PUERTODELAINSTANCIA>
```

![Instance animals-service 1](https://github.com/tomassiNico/microservices-consul/images/animals-instance-1.png)

Luego de ejecutar la instancia si volvemos a consultar la interfaz de Consul en ``` http://localhost:8500/ ``` deberiamos ver el servicio de animales levantado y si clickeamos sobre el mismo veremos todas las instancias del mismo que se encuentren registradas en Consul

![Consul Server Services](https://github.com/tomassiNico/microservices-consul/images/consul-server-ui-2.png)

![Consul Server Animals Service detail](https://github.com/tomassiNico/microservices-consul/images/consul-server-ui-serviceAnimal.png)

4. En una nueva consola dirigete al directorio del servicio de alimentos y ejecuta una instancia

```
cd <RUTADELREPO>/microservice-consul/food-service

node server.js <PUERTODELAINSTANCIA>
```

![Food instance 1](https://github.com/tomassiNico/microservices-consul/images/food-instance-1.png)

![Consul Server Services](https://github.com/tomassiNico/microservices-consul/images/consul-server-ui-3.png)

Puede obtener la direccion donde esta alojado tu servicio de alimentos de la interfaz de Consul

![Address Food Service](https://github.com/tomassiNico/microservices-consul/images/addres-food-service.png)

Ingresa con el navegador a esa direccion

![Address Food Service Ruequest basic](https://github.com/tomassiNico/microservices-consul/images/request-services-food-service-basic.png)

5. Ahora la aplicacion esta lista y funcionando, probemos que nuestros microservicios se pueda comunicar. Ahora ingresa con tu navegador al servicio de alimentos en la ruta ``` http://<AddressFoodService>/foods/3 ```

![Address Food Service Ruequest 1](https://github.com/tomassiNico/microservices-consul/images/request-services-food-service-1.png)

Si vemos en el log de la consola donde levantamos el servicio de alimentos veremos a que servicio de animales le esta realizando la peticion para obtener los datos de los animales. Intentemos levantar otra instancia de este ```animals-service``` para lograr ver que ahora ```food-service``` realizara peticiones a cualquiera de estas instancias


```
#consola 3
cd <RUTADELREPO>/microservice-consul/food-service

node server.js <PUERTODELAINSTANCIA2>
```
```
#consola 4
cd <RUTADELREPO>/microservice-consul/food-service

node server.js <PUERTODELAINSTANCIA3>
```

![Animals instance 2](https://github.com/tomassiNico/microservices-consul/images/animals-instance-2.png)

![Animals instance 3](https://github.com/tomassiNico/microservices-consul/images/animals-instance-3.png)

Si vemos en la interfaz de Consul podremos ver las tres instancias con sus direcciones

![Consul Server multiple instances](https://github.com/tomassiNico/microservices-consul/images/animals-multiple-instances.png)

Como vemos hay ahora tres instancias de este servicio registradas a Consul, si ahora accedemos a ``` http://<AddressFoodService>/foods/3 ``` veremos en el  log de ``` food-service``` cada peticion la realiza a cualquiera de las  instancias del servicio de animales.

![Address Food Service Ruequest 1](https://github.com/tomassiNico/microservices-consul/images/request-services-food-service-2.png)

### Conclusiones
Consul nos permite en una arquitectura de microservicios automatizar el registro de las distintas instancias de estos y permite a otros servicios el descubrimientos de estos y sus direcciones de manera dinamica permitiendo el habilitar y deshabilitar instancias dinamicamente
