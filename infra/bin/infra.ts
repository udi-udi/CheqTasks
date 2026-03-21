#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CheqTasksStack } from '../lib/cheqtasks-stack';

const app = new cdk.App();
new CheqTasksStack(app, 'CheqTasksStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',
  },
});
