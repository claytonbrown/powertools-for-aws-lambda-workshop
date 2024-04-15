import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodeHelloWorld } from './otel-tests/node/hello-world-node-stack';
import { PythonHelloWorld } from './otel-tests/python/hello-world-python-stack';
import { NagSuppressions } from 'cdk-nag';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';

export class ServerlessCdkOtelStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new NodeHelloWorld(this, `${Runtime.NODEJS_18_X}-${Architecture.ARM_64}`,{ 'arch': Architecture.ARM_64, 'runtime': Runtime.NODEJS_18_X });
    new NodeHelloWorld(this, `${Runtime.NODEJS_18_X}-${Architecture.X86_64}`,{ 'arch': Architecture.X86_64, 'runtime': Runtime.NODEJS_18_X });

    // new PythonHelloWorld(this, `${Runtime.PYTHON_3_12}-${Architecture.ARM_64}`,{ 'arch': Architecture.ARM_64, 'runtime': Runtime.PYTHON_3_12 });
    // new PythonHelloWorld(this, `${Runtime.PYTHON_3_12}-${Architecture.X86_64}`,{ 'arch': Architecture.X86_64, 'runtime': Runtime.PYTHON_3_12 });

    // Example of STACK level supressions
    NagSuppressions.addStackSuppressions(this, [
      { id: 'AwsSolutions-L1', reason: 'Ignore - The non-container Lambda function is not configured to use the latest runtime version.'},
      { id: 'AwsSolutions-IAM4', reason: 'Ignore - The IAM user, role, or group uses AWS managed policies which is fine.'},
      { id: 'AwsSolutions-IAM5', reason: 'Ignore - yThe IAM entity contains wildcard permissions and is ok for production.'},
      // { id: 'AwsSolutions-APIG1', reason: 'Ignore -  The API does not need access logging enabled.'},
      // { id: 'AwsSolutions-APIG2', reason: 'Ignore - The REST API does not need request validation enabled.'},
      // { id: 'AwsSolutions-APIG3', reason: 'Ignore - The REST API stage is not associated with AWS WAFv2 web ACL.'},
      // { id: 'AwsSolutions-APIG4', reason: 'Ignore -  The API does not implement authorization.' },
      // { id: 'AwsSolutions-APIG6',reason: 'Ignore - The REST API Stage does not have CloudWatch logging enabled for all methods.'},
      // { id: 'AwsSolutions-COG4', reason: 'Ignore - The API GW method does not use a Cognito user pool authorizer.'},
      { id: 'AwsSolutions-DDB3', reason: 'Ignore - The DynamoDB table does not have Point-in-time Recovery enabled.'}
    ]);

    // Example of RESOURCE level supressions
    // NagSuppressions.addResourceSuppressionsByPath(this, '/lambda-otel-test/hello-world/apigw/Resource', [
    //   {
    //     id: 'AwsSolutions-APIG2',
    //     reason: 'Ignore - The REST API does not need request validation enabled.',
    //   },
    // ]);

    // NagSuppressions.addResourceSuppressionsByPath(this, '/lambda-otel-test/hello-world/apigw/Default/{proxy+}/ANY/Resource', [
    //   {
    //     id: 'AwsSolutions-APIG4',
    //     reason: 'Ignore -  The API does not implement authorization.',
    //   },
    //   {
    //     id: 'AwsSolutions-COG4',
    //     reason: 'Ignore - The API GW method does not use a Cognito user pool authorizer.',
    //   },
    // ]);

    // NagSuppressions.addResourceSuppressionsByPath(this, '/lambda-otel-test/hello-world/apigw/Default/ANY/Resource', [
    //   {
    //     id: 'AwsSolutions-APIG4',
    //     reason: 'Ignore -  The API does not implement authorization.',
    //   },
    //   {
    //     id: 'AwsSolutions-COG4',
    //     reason: 'Ignore - The API GW method does not use a Cognito user pool authorizer.',
    //   },
    // ]);

    // NagSuppressions.addResourceSuppressionsByPath(this, '/lambda-otel-test/hello-world/apigw/DeploymentStage.prod/Resource', [
    //   {
    //     id: 'AwsSolutions-APIG3',
    //     reason: 'Ignore - The REST API stage is not associated with AWS WAFv2 web ACL.',
    //   },
    //   {
    //     id: 'AwsSolutions-APIG6',
    //     reason: 'Ignore - The REST API Stage does not have CloudWatch logging enabled for all methods.',
    //   },
    // ]);
  }
}
