import * as path from "path"
import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";
import * as rds from "@aws-cdk/aws-rds";
import { NodejsFunctionProps, NodejsFunction } from "@aws-cdk/aws-lambda-nodejs"
import { Runtime } from '@aws-cdk/aws-lambda';

export class LambdaStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, 'VpcLambda', {
      vpcId: 'VpcLambda',
      vpcName: 'VpcLambda',
    })

    const dbSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'DbSecurityGroup', `${process.env.SECURITY_GROUP_ID}`, {
      allowAllOutbound: true,
    });

    const dbInstance = rds.DatabaseInstance.fromDatabaseInstanceAttributes(this, 'Instance', {
      instanceIdentifier: `${process.env.INSTANCE_IDENTIFIER}`,
      instanceEndpointAddress: `${process.env.INSTANCE_ENDPOINT_ADDRESS}`,
      port: 5432,
      securityGroups: [dbSecurityGroup],
    })

    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: [
          'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
          'pg-native',
        ],
      },
      runtime: Runtime.NODEJS_16_X,
      timeout: cdk.Duration.minutes(3), // Default is 3 seconds
      memorySize: 256,
    };

    const lambdaSG = new ec2.SecurityGroup(this, 'LambdaSG', {
      vpc,
    });

    dbSecurityGroup.addIngressRule(
      lambdaSG,
      ec2.Port.tcp(5432),
      'Lambda to Postgres database'
    );

    const rdsLambdaFn = new NodejsFunction(this, 'rdsLambdaFn', {
      entry: path.join(__dirname, '../src/lambdas', 'rds-lambda.ts'),
      ...nodeJsFunctionProps,
      functionName: 'rdsLambdaFn',
      environment: {
        DB_ENDPOINT_ADDRESS: dbInstance.dbInstanceEndpointAddress,
        DB_NAME: `${process.env.DB_NAME}`,
        DB_SECRET_ARN: dbInstance.secret?.secretFullArn || '',
      },
      vpc,
      vpcSubnets: vpc.selectSubnets({
        subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
      }),
      securityGroups: [lambdaSG],
    });

    dbInstance.secret?.grantRead(rdsLambdaFn);
  }
}
