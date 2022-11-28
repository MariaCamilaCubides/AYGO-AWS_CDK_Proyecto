import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";
import * as rds from "@aws-cdk/aws-rds";
import * as iam from "@aws-cdk/aws-iam";

export class DatabaseStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const vpc = new ec2.Vpc(this, 'VpcLambda', {
      vpcName: 'VpcLambda',
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'privatelambda',
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
        },
        {
          cidrMask: 24,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DbSecurityGroup', {
      vpc,
    });

    const dbInstance = new rds.DatabaseInstance(this, 'Instance', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_13,
      }),

      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      vpc,
      vpcSubnets: vpc.selectSubnets({
        subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
      }),
      instanceIdentifier: 'localDB',
      databaseName: 'localDB',
      securityGroups: [dbSecurityGroup],
      credentials: rds.Credentials.fromGeneratedSecret('postgres'),
      maxAllocatedStorage: 200,
    });

    // const role = iam.Role.fromRoleArn(this, 'Role', `${process.env.ROLE_ARN}`, {
    //   mutable: false,
    // });

    // new rds.DatabaseProxy(this, 'Proxy', {
    //   proxyTarget: rds.ProxyTarget.fromInstance(dbInstance),
    //   secrets: [dbInstance.secret!],
    //   securityGroups: [dbSecurityGroup],
    //   role,
    //   vpc,
    //   requireTLS: false,
    //   vpcSubnets: vpc.selectSubnets({
    //     subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
    //   }),
    // });
  }
}
