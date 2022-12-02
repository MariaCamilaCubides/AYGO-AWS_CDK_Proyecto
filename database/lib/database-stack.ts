import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";
import * as rds from "@aws-cdk/aws-rds";
import * as iam from "@aws-cdk/aws-iam";

export class DatabaseStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const vpc = ec2.Vpc.fromLookup(this, "VPC", {
      isDefault: true
    });

    const dbSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'SecurityGroupImport', `${process.env.SECURITY_GROUP_ID}`, {
      allowAllOutbound: true,
    });

    const lambdaSG = new ec2.SecurityGroup(this, 'LambdaSG', {
      vpc,
    });

    dbSecurityGroup.addIngressRule(
      lambdaSG,
      ec2.Port.tcp(5432),
      'Lambda to Postgres database'
    );

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
        subnetType: ec2.SubnetType.PUBLIC,
      }),
      publiclyAccessible: true,
      instanceIdentifier: 'finalProyectDb',
      databaseName: 'finalProyectDb',
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
    //     subnetType: ec2.SubnetType.PUBLIC,
    //   }),
    // });
  }
}
