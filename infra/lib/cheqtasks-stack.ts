import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class CheqTasksStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sshPublicKey = this.node.tryGetContext('sshPublicKey') as string;
    if (!sshPublicKey) {
      throw new Error(
        'sshPublicKey context is required.\n' +
        'Deploy with: cdk deploy --context sshPublicKey="$(cat ~/.ssh/cheqtasks_deploy.pub)"',
      );
    }

    // ── VPC ────────────────────────────────────────────────────────────────────
    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 1,
      natGateways: 0,
      subnetConfiguration: [
        { name: 'Public', subnetType: ec2.SubnetType.PUBLIC, cidrMask: 24 },
      ],
    });

    // ── Security group ─────────────────────────────────────────────────────────
    const sg = new ec2.SecurityGroup(this, 'Sg', {
      vpc,
      description: 'CheqTasks EC2',
      allowAllOutbound: true,
    });
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(3000), 'App');
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'SSH (CI/CD)');

    // ── IAM role ───────────────────────────────────────────────────────────────
    const role = new iam.Role(this, 'Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });
    const secret = secretsmanager.Secret.fromSecretNameV2(
      this, 'DbSecret', 'cheqtasks/database-url',
    );
    secret.grantRead(role);

    // ── User data ──────────────────────────────────────────────────────────────
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      // System setup
      'dnf update -y',
      'dnf install -y git docker',
      'systemctl start docker',
      'systemctl enable docker',
      'usermod -aG docker ec2-user',

      // SSH key for CI/CD pipeline
      'mkdir -p /home/ec2-user/.ssh',
      `echo "${sshPublicKey}" >> /home/ec2-user/.ssh/authorized_keys`,
      'chown -R ec2-user:ec2-user /home/ec2-user/.ssh',
      'chmod 700 /home/ec2-user/.ssh',
      'chmod 600 /home/ec2-user/.ssh/authorized_keys',

      // Fetch DATABASE_URL from Secrets Manager
      'DB_URL=$(aws secretsmanager get-secret-value --secret-id cheqtasks/database-url --region us-east-1 --query SecretString --output text)',

      // Clone, build and run
      'git clone https://github.com/udi-udi/CheqTasks /app',
      'cd /app',
      'docker build -t cheqtasks .',
      'docker run -d -p 3000:3000 -e DATABASE_URL="$DB_URL" --name cheqtasks --restart unless-stopped cheqtasks',
    );

    // ── EC2 instance ───────────────────────────────────────────────────────────
    const instance = new ec2.Instance(this, 'Instance', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      securityGroup: sg,
      role,
      userData,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
    });

    // ── Outputs ────────────────────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'PublicIp', {
      value: instance.instancePublicIp,
      description: 'EC2 public IP',
    });
    new cdk.CfnOutput(this, 'AppUrl', {
      value: `http://${instance.instancePublicDnsName}:3000`,
      description: 'CheqTasks API URL',
    });
  }
}
