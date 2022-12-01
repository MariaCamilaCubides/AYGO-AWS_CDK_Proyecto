const AWS = require('aws-sdk');
const pg = require('pg');

exports.handler = async (event, context, callback) => {
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            Error: 'Unexpected error'
        })
    };
    try {
        const password = 'wSqu4wW6VXR07WbgH5w6^LIevXxuyV'
        console.log('1')
        const client = new pg.Client({
          user: 'postgres',
          host: 'finalproyectdb.cpagihdbpowx.us-east-1.rds.amazonaws.com',
          database: 'finalProyectDb',
          password,
          port: 5432,
        });
        console.log('2');
        await client.connect();
        console.log('3')
        const queryText = 'INSERT INTO "timeOff" (id, profile, "hoursAmount","dateTimeRange", "fileUrl", status) VALUES($1, $2, $3, $4, $5, $6)';
        const queryValues = [
            AWS.util.uuid.v4(),
            AWS.util.uuid.v4(),
            3,
            [],
            event.fileUrl,
            0
        ];
        const queryString = {
            text: queryText,
            values: queryValues,
        };
        console.log(queryString)
        const res = await client.query(queryString);
        console.log(res);
        await client.end()
        console.log('4')
    } catch (err) {
        console.log('Error while trying to connect to db', err);
        response.body = 'Error'
    }
    return {
    statusCode: 200,
    body: 'hola',
    headers: {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
    },
    };
};
