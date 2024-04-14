#!/usr/bin/env node
import 'source-map-support/register';
import { App, Aspects, Tags } from 'aws-cdk-lib';
// import { IConstruct } from 'constructs'; // IAspect  Tag
import { InfraStack } from '../lib/infra-stack';
import { IdeStack } from '../lib/ide-stack';
import { powertoolsServiceName, environment } from '../lib/constants';
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { TheLambdaPowerTunerStack } from '../lib/the-lambda-power-tuner-stack';
import { ServerlessCdkOtelStack } from '../lib/otel-stack';

// VARIABLES FOR USE IN TAGGING ETC - CAN MOVE TO CONSTANTS JUST EASIER TO READ HERE
var owner = require('child_process').execSync('whoami').toString().trim();
var project = require('child_process').execSync('basename `git rev-parse --show-toplevel`').toString().trim();
var gitRepo = require('child_process').execSync(' git ls-remote --get-url').toString().trim()
var gitHash = require('child_process').execSync('git rev-parse HEAD').toString().trim()
var gitBranch = require('child_process').execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
var cdkVersion = require('child_process').execSync('cdk --version').toString().trim().replace('(','').replace(')','')

const app = new App();


// DECORATE STANDARD TAGS
Tags.of(app).add('Owner', owner);
Tags.of(app).add('CostCenter', 'sa-demo');
Tags.of(app).add('Stack', project);
Tags.of(app).add('Environment', environment);
Tags.of(app).add('GitRepo', gitRepo);
Tags.of(app).add('GitCommit', gitHash);
Tags.of(app).add('GitBranch', gitBranch);
Tags.of(app).add('ManagedBy', `CDK ${cdkVersion} +ASC`);
Tags.of(app).add('LastDeploy', new Date().toISOString() ); // Warning this pollutes DIFFs as mutate of Tag for all resources
//Tags.of(app).add('AWSRegion', process.env.CDK_DEFAULT_REGION || 'N/A');
//Tags.of(app).add('AwsAccountId', process.env.CDK_DEFAULT_ACCOUNT || 'N/A');


// APPLY CDK-NAG SOLUTION CHECKS
Aspects.of(app).add(new AwsSolutionsChecks());


// TAG CDK PATHs EXAMPLE VISTOR PATTERN
// class PathTagger implements IAspect {
//   visit(node: IConstruct) {
//     new Tag("CDKPath", node.node.path).visit(node);
//   }
// }
// Aspects.of(app).add(new PathTagger());

const infraStack = new InfraStack(app, 'powertoolsworkshopinfra', {
  tags: {
    Service: powertoolsServiceName,
  },
});
Tags.of(infraStack).add('ComplianceScope', 'PCI/SOC2');

const ideStack = new IdeStack(app, 'powertoolsworkshopide', {
  tags: {
    Service: 'powertools-ide', // overwrite for supporting infra to call out costs seperately
  },
});
Tags.of(ideStack).add('ComplianceScope', 'SOC2');

const otelStack =  new ServerlessCdkOtelStack(app, 'lambda-otel-test', {
  tags: {
    Service: 'lambda-otel-test', // overwrite - tests as isolated cost from core app
  },
});
Tags.of(otelStack).add('ComplianceScope', 'None');

const powerTunerStack  = new TheLambdaPowerTunerStack(app, 'powertuner', {
  tags: {
    // over riding for supporting test infra to call out costs seperately
    Service: 'powertuner',
  },
});
Tags.of(powerTunerStack).add('ComplianceScope', 'None');

