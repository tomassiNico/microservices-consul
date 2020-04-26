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

<imgServerConsul1>

3. Dirigete al directorio del servicio de animales y ejecuta una instancia del mismo
```
cd <RUTADELREPO>/microservice-consul/animals-service

node server.js <PUERTODELAINSTANCIA>
```
Luego de ejecutar la instancia si volvemos a consultar la interfaz de Consul en ``` http://localhost:8500/ ``` deberiamos ver el servicio de animales levantado y si clickeamos sobre el mismo veremos todas las instancias del mismo que se encuentren registradas en Consul

<imgServerConsul2>
<imgServicioAnimalDetalle1>

4. En una nueva consola dirigete al directorio del servicio de alimentos y ejecuta una instancia

```
cd <RUTADELREPO>/microservice-consul/food-service

node server.js <PUERTODELAINSTANCIA>
```

<imgExampleFoodInstance1>
<imgServerConsul1>
<imgServicioFoodDetalle1>

5. Ahora la aplicacion esta lista para funcionar, probemos que nuestros microservicios se pueda comunicar. Ahora ingresa con tu navegador al servicio de alimentos en la ruta ``` http://<AddressFoodService>/foods/3 ```

<respuestaIMG>

Si vemos en el log de la consola donde levantamos el servicio de alimentos veremos a que servicio de animales le esta realizando la peticion para obtener los datos de los animales. Intentemos levantar otra instancia de este ```animals-service``` para lograr ver que esta ahora ```food-service``` realizara peticiones a cualquiera de estas instancias


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

<imgServiceFoodConsulDetail3>

Como vemos hay ahora tres instancias de este servicio registradas a Consul, si ahora accedemos a ``` http://<AddressFoodService>/foods/3 ``` veremos en el  log de ``` food-service``` cada peticion la realiza a cualquiera de las  instancias del servicio de animales.

### Conclusiones
Consul nos permite en una arquitectura de microservicios automatizar el registro de las distintas instancias de estos y permite a otros servicios el descubrimientos de estos y sus direcciones de manera dinamica permitiendo el habilitar y deshabilitar instancias dinamicamente
