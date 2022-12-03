# AYGO-AWS_CDK_Proyecto
Este proyecto contiene el desarrollo de 3 CDK que despliega un prototipo para cargar un archivo en un bucket S3 y crear un registro en una base de datos relacional (postgres). 

## Despliegue de base datos
Para desplegar la base de datos se utiliza la VPC por defecto de AWS, alli se crean dos grupos de seguridad uno para la base de datos y otro para la lambda, al grupo de seguridad de la base de datos se le agregan dos reglas de acceso, la primera regla de acceso para permitir la comunicación TCP por el puerto 5432 desde una IPv4 Y la segunda para permitir la comunicación de la lambda por el puerto 5432. 

El despliegue del CDK requiere de las siguientes variables de entorno

```
AWS_ACCOUNT=
AWS_REGION=
ROLE_ARN=
```
Al finalizar el despliegue puede encontrar las credenciales de acceso en AWS Secret Manager, conectese a la instancia y cree la tabla timeOff.

```
CREATE TABLE IF NOT EXISTS public."timeOff"
(
    id uuid NOT NULL,
    profile uuid,
    "fileUrl" text COLLATE pg_catalog."default",
    status integer,
    "hoursAmount" integer,
    "dateTimeRange" timestamp without time zone[],
    CONSTRAINT "timeOff_pkey" PRIMARY KEY (id)
)
```


## Despliegue de la función lambda
El despliegue de la lambda no se encuentra automatizado y es necesario realizarlo manualmente.

Dirijase al servicio Lambda y cree una nueva función con node 14, configure el rol y habilite el uso de VPC, escoja la VPC por defecto (la misma en la que se encuentra la base de datos), configure al menos dos sub-redes y escoja el grupo de seguridad Db/LambdaSG.

El código de la función se encuentra en la carpeta lambdaFunction, para hacer uso de este debe comprimirlo.

Para comprimir el código en Windows corra el comando
```
Compress-Archive -LiteralPath node_modules, index.js -DestinationPath lambda.zip
```

Para comprimir el codigo en Mac corra el comando
```
zip -r Lambda-Deployment.zip
```

Después de comprimir el código importerlo en la función lambda.

Finalmente agregue las variables de entorno a la función
```
DB_ENDPOINT_ADDRESS=
DB_NAME=
DB_PASSWORD=
```
## Despliegue del API gateway
Para desplegar el API gateway añada las variables de entorno y ejecute `cdk deploy`
```
AWS_ACCOUNT=
AWS_REGION=
ROLE_ARN=
LAMBDA_ARN=
```

## Despliegue del bucket S3 
Para desplegar el bucket añada las variables de entorno y ejecute `cdk deploy`
```
AWS_ACCOUNT=
AWS_REGION=
```