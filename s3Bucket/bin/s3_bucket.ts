#!/usr/bin/env node
import 'source-map-support/register';
import * as dotenv from 'dotenv'
import * as cdk from '@aws-cdk/core';
import { S3BucketStack } from '../lib/s3_bucket-stack';

dotenv.config();

const app = new cdk.App();
new S3BucketStack(app, 'S3BucketStack', {
  env: { account: process.env.AWS_ACCOUNT, region: process.env.AWS_REGION },
});