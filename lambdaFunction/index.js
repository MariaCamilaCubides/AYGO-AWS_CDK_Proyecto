const AWS = require('aws-sdk');
const pg = require('pg');

exports.handler = async (event, context, callback) => {
    const response = {
        statusCode: 500,
        body: JSON.stringify({
            Error: 'Unexpected error'
        })
    };
    try {
        const client = new pg.Client({
          user: 'postgres',
          host: `${process.env.DB_ENDPOINT_ADDRESS}`,
          database: `${process.env.DB_NAME}`,
          password: `${process.env.DB_PASSWORD}`,
          port: 5432,
        });
        await client.connect();
        const queryText = 'INSERT INTO "timeOff" (id, profile, "hoursAmount","dateTimeRange", "fileUrl", status) VALUES($1, $2, $3, $4, $5, $6)';
        const queryValues = [
            AWS.util.uuid.v4(),
            AWS.util.uuid.v4(),
            parseInt(event.amountHours),
            [new Date(event.initialDateTime), new Date(event.finalDateTime)],
            event.fileUrl,
            parseInt(event.status)
        ];
        const queryString = {
            text: queryText,
            values: queryValues,
        };
        await client.query(queryString);
        await client.end()
        response.statusCode = 200;
        response.body = 'Time off requested. Waiting for the approval';
    } catch (err) {
        console.log('error', err);
        response.body = 'Error requesting time off'
    }
    return {
        ...response,
        headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST"
        },
    };
};
