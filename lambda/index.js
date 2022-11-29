import * as AWS from 'aws-sdk';
import { Client } from 'pg';

exports.handler = async (event, context, callback) => {
    const response = {
        statusCode: 500,
        body: JSON.stringify({
            Error: 'Unexpected error'
        })
    };
    try {
        const host = process.env.DB_ENDPOINT_ADDRESS || '';
        console.log(`host:${host}`);
        const database = process.env.DB_NAME || '';
        const dbSecretArn = process.env.DB_SECRET_ARN || '';
        const secretManager = new AWS.SecretsManager({
          region: 'us-east-1',
        });
        const secretParams: AWS.SecretsManager.GetSecretValueRequest = {
          SecretId: dbSecretArn,
        };
        const dbSecret = await secretManager.getSecretValue(secretParams).promise();
        const secretString = dbSecret.SecretString || '';
    
        if (!secretString) {
          throw new Error('Secret string is empty');
        }
    
        const { password } = JSON.parse(secretString);
    
        const client = new Client({
          user: 'postgres',
          host,
          database,
          password,
          port: 5432,
        });
        await client.connect();
        const queryText = 'INSERT INTO timeOff(id, profile, "hoursAmount","dateTimeRange", "fileUrl", status) VALUES($1, $2, $3, $4, $5, $6)';
        const queryValues = [
            AWS.util.uuid.v4(),
            event.profile,
            event.hoursAmount,
            event.dateTimeRange,
            event.fileUrl,
            event.status
        ];
        const res = await client.query(queryText, queryValues);
        console.log(res.rows[0].message); // Hello world!
        response.statusCode = 200;
        response.body = 'Created'
        await client.end();
      } catch (err) {
        console.log('Error while trying to connect to db', err);
        response.body = 'Error'
      }

    lambdaResponse(callback, response.statusCode, response.body);
};

function lambdaResponse(callback, statusCode, body) {
    callback(null, {
    statusCode,
    body,
    headers: {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
    },
  });
}
