import * as cdk from '@aws-cdk/core';
import * as apiGateway from "@aws-cdk/aws-apigateway"
import * as cognito from "@aws-cdk/aws-cognito"
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";

export class ApiGatewayStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const role = iam.Role.fromRoleArn(this, 'Role', `${process.env.ROLE_ARN}`, {
      mutable: false,
    });

    /* const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'finalProjectUsers',
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
        tempPasswordValidity: cdk.Duration.days(30),
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: false,
        },
      },
    });

    const auth = new apiGateway.CognitoUserPoolsAuthorizer(this, 'finalProjectAuthorizer', {
      cognitoUserPools: [userPool]
    }); */

    const api = new apiGateway.RestApi(this, 'S3Api', {
      cloudWatchRole: false,
      restApiName: "Final project S3 API",
      binaryMediaTypes: ["*/*"],
      minimumCompressionSize: 0,
      endpointConfiguration: {
        types: [ apiGateway.EndpointType.EDGE ]
      }
    });

    const bucketResource = api.root.addResource('{bucket}');

    const bucketItemResource = bucketResource.addResource('{item}');

    const putObjectIntegration = new apiGateway.AwsIntegration({
      service: "s3",
      region: "us-east-1",
      path: '{bucket}/{item}',
      integrationHttpMethod: "PUT",
      options: {
        credentialsRole: role,
        passthroughBehavior: apiGateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
        requestParameters: { 
          'integration.request.path.bucket': 'method.request.path.bucket',
          'integration.request.path.item': 'method.request.path.item',
          'integration.request.header.Accept': 'method.request.header.Accept' 
        },
        integrationResponses: [{
          statusCode: '200',
          responseParameters: { 'method.response.header.Content-Type': 'integration.response.header.Content-Type'}
        }]        
      }
    });

    //PutObject method options
    const putObjectMethodOptions = {
      // authorizer: auth,
      authorizationType: apiGateway.AuthorizationType.NONE,
      requestParameters: {
        'method.request.path.bucket': true,
        'method.request.path.item': true,
        'method.request.header.Accept': false,
        'method.request.header.Content-Type': false
      },
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Content-Type': true
          }
        }]
    };
    bucketItemResource.addMethod("PUT", putObjectIntegration, putObjectMethodOptions);

    const api2 = new apiGateway.RestApi(this, 'lambdaApi', {
      cloudWatchRole: false,
      restApiName: "Final project lambda API",
      minimumCompressionSize: 0,
      endpointConfiguration: {
        types: [ apiGateway.EndpointType.EDGE ]
      }
    });

    const lambdaResource = api2.root.addResource('timeOff')

    const importedLambdaFromArn = lambda.Function.fromFunctionArn(
      this,
      'external-lambda-from-arn',
      `${process.env.LAMBDA_ARN}`,
    );

    lambdaResource.addMethod('POST', new apiGateway.LambdaIntegration(importedLambdaFromArn), {
      // authorizer: auth,
      authorizationType: apiGateway.AuthorizationType.NONE,
    });

  }
}
