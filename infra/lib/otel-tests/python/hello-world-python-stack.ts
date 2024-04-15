import { Construct } from 'constructs';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
//import { Role, ServicePrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import {
  Architecture,
  Runtime,
  AdotLambdaExecWrapper,
  AdotLayerVersion,
  AdotLambdaLayerJavaScriptSdkVersion,
} from 'aws-cdk-lib/aws-lambda';

export interface PythonHelloWorldProps {
  readonly arch: Architecture;
  readonly runtime: Runtime;
}

export class PythonHelloWorld extends Construct {
  constructor(scope: Construct, id: string, props: PythonHelloWorldProps) {
    super(scope, id);

    const table = new Table(scope,  `ddb-otel-python-${props.arch}`, {
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      }
    })

    const helloFunctionBasic = new lambda.Function(this, `basic-${props.arch}-${props.runtime}`, {
      runtime: props.runtime, // Choose any supported Python3 runtime
      code: lambda.Code.fromAsset('lib/otel-tests/python/basic'), // Points to the lambda directory
      architecture: props.arch,
      memorySize: 1024,
      environment: {
        DDB_TABLE_NAME: table.tableName
      },
      layers: [],
      tracing: lambda.Tracing.DISABLED,
      handler: 'hello.handler', // Points to the 'hello' file in the lambda directory
    });
    table.grantReadWriteData(helloFunctionBasic);


    const helloFunctionXRAYSDK = new lambda.Function(this, `xraysdk-${props.arch}-${props.runtime}`, {
      runtime: props.runtime, // Choose any supported Python3 runtime
      code: lambda.Code.fromAsset('lib/otel-tests/python/xraysdk'), // Points to the lambda directory
      architecture: props.arch,
      memorySize: 1024,
      environment: {
        DDB_TABLE_NAME: table.tableName
      },
      layers: [],
      tracing: lambda.Tracing.DISABLED,
      handler: 'hello.handler', // Points to the 'hello' file in the lambda directory
    });
    table.grantReadWriteData(helloFunctionXRAYSDK);

    const helloFunctionADOTAuto = new lambda.Function(this, `adot-auto-${props.arch}-${props.runtime}`, {
      runtime: props.runtime, // Choose any supported Python3 runtime
      code: lambda.Code.fromAsset('lib/otel-tests/python/adot-auto'), // Points to the lambda directory
      architecture: props.arch,
      memorySize: 1024,
      environment: {
        DDB_TABLE_NAME: table.tableName
      },
      layers: [],
      tracing: lambda.Tracing.DISABLED,
      handler: 'hello.handler', // Points to the 'hello' file in the lambda directory
    });
    table.grantReadWriteData(helloFunctionADOTAuto);


    const helloFunctionOtelCustom = new lambda.Function(this, `adot-custom-${props.arch}-${props.runtime}`, {
      runtime: props.runtime, // Choose any supported Python3 runtime
      code: lambda.Code.fromAsset('lib/otel-tests/python/adot-custom'), // Points to the lambda directory
      architecture: props.arch,
      memorySize: 1024,
      environment: {
        DDB_TABLE_NAME: table.tableName
      },
      layers: [],
      tracing: lambda.Tracing.DISABLED,
      handler: 'hello.handler', // Points to the 'hello' file in the lambda directory
    });
    table.grantReadWriteData(helloFunctionOtelCustom);

  }
}