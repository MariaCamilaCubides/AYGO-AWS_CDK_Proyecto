#!/usr/bin/env node
import 'source-map-support/register';
import * as dotenv from 'dotenv'
import * as cdk from '@aws-cdk/core';
import { DatabaseStack } from '../lib/database-stack';

dotenv.config();

const app = new cdk.App();
new DatabaseStack(app, 'DatabaseStack', {
  env: { account: process.env.AWS_ACCOUNT, region: process.env.AWS_REGION },
});