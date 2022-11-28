#!/usr/bin/env node
import 'source-map-support/register';
import * as dotenv from 'dotenv'
import * as cdk from '@aws-cdk/core';
import { LambdaStack } from '../lib/lambda-stack';

dotenv.config();

const app = new cdk.App();
new LambdaStack(app, 'LambdaStack', {
  env: { account: process.env.AWS_ACCOUNT, region: process.env.AWS_REGION },
});