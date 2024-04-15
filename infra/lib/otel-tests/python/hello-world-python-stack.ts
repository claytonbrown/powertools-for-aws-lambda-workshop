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
  AdotInstrumentationConfig,
  AdotLambdaLayerPythonSdkVersion
} from 'aws-cdk-lib/aws-lambda';

export interface PythonHelloWorldProps {
  readonly arch: Architecture;
  readonly runtime: Runtime;
}
/*
Lambda integrates with AWS X-Ray to help you trace, debug, and optimize Lambda applications. You can use X-Ray to trace a request as it traverses resources in your application, which may include Lambda functions and other AWS services.

To send tracing data to X-Ray, you can use one of three SDK libraries:

- AWS Distro for OpenTelemetry (ADOT) – A secure, production-ready, AWS-supported distribution of the OpenTelemetry (OTel) SDK.

- AWS X-Ray SDK for Python – An SDK for generating and sending trace data to X-Ray.

- Powertools for AWS Lambda (Python) – A developer toolkit to implement Serverless best practices and increase developer velocity.
*/

export class PythonHelloWorld extends Construct {
  constructor(scope: Construct, id: string, props: PythonHelloWorldProps) {
    super(scope, id);

    const table = new Table(scope,  `ddb-otel-python-${props.runtime}-${props.arch}`, {
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
        DDB_TABLE_NAME: table.tableName,
        FUNCTION_NAME: `${props.runtime}-${props.arch}`
      },
      layers: [],
      tracing: lambda.Tracing.DISABLED,
      handler: 'lambda_function.lambda_handler', // Points to the 'hello' file in the lambda directory
    });
    table.grantReadWriteData(helloFunctionBasic);


    /*https://docs.powertools.aws.dev/lambda/python/latest/
    // REF: https://docs.powertools.aws.dev/lambda/python/latest/core/tracer/
    const helloFunctionPowerTools = new lambda.Function(this, `powertools-${props.arch}-${props.runtime}`, {
      runtime: props.runtime, // Choose any supported Python3 runtime
      code: lambda.Code.fromAsset('lib/otel-tests/python/powertools'), // Points to the lambda directory
      architecture: props.arch,
      memorySize: 1024,
      environment: {
        DDB_TABLE_NAME: table.tableName,
        POWERTOOLS_SERVICE_NAME: `${props.arch}-${props.runtime}`,
        FUNCTION_NAME: `${props.runtime}-${props.arch}`
      },
      layers: [
        lambda.LayerVersion.fromLayerVersionArn(this, 'PowertoolsLayer', 'arn:aws:lambda:ap-southeast-2:123456789012:layer:PowertoolsLayer:1')
      ],
      tracing: lambda.Tracing.ACTIVE,
      handler: 'lambda_function.lambda_handler', // Points to the 'hello' file in the lambda directory
    });
    table.grantReadWriteData(helloFunctionPowerTools);
    */


    // REF: https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-python.html
    const helloFunctionXRAYSDK = new lambda.Function(this, `xraysdk-${props.arch}-${props.runtime}`, {
      runtime: props.runtime, // Choose any supported Python3 runtime
      code: lambda.Code.fromAsset('lib/otel-tests/python/xraysdk'), // Points to the lambda directory
      architecture: props.arch,
      memorySize: 1024,
      environment: {
        DDB_TABLE_NAME: table.tableName,
        FUNCTION_NAME: `${props.runtime}-${props.arch}`
      },
      layers: [],
      tracing: lambda.Tracing.ACTIVE,
      handler: 'lambda_function.lambda_handler', // Points to the 'hello' file in the lambda directory
    });
    table.grantReadWriteData(helloFunctionXRAYSDK);

    // REF: https://aws-otel.github.io/docs/getting-started/lambda/lambda-python

    const helloFunctionADOTAuto = new lambda.Function(this, `adot-auto-${props.arch}-${props.runtime}`, {
      runtime: props.runtime, // Choose any supported Python3 runtime
      code: lambda.Code.fromAsset('lib/otel-tests/python/adot-auto'), // Points to the lambda directory
      architecture: props.arch,
      memorySize: 1024,
      environment: {
        DDB_TABLE_NAME: table.tableName,
        AWS_LAMBDA_EXEC_WRAPPER: '/opt/otel-instrument',
        FUNCTION_NAME: `${props.runtime}-${props.arch}`,
        // REGULAR_HANDLER: '/opt/otel-handler',
        // PROXY_HANDLER: '/opt/otel-proxy-handler',
        // STREAM_HANDLER: '/opt/otel-stream-handler',
      },
      layers: [
      ],
      adotInstrumentation: {
        layerVersion: AdotLayerVersion.fromPythonSdkLayerVersion(AdotLambdaLayerPythonSdkVersion.LATEST),
        execWrapper: AdotLambdaExecWrapper.INSTRUMENT_HANDLER,
      },
      // tracing: lambda.Tracing.ACTIVE,
      handler: 'lambda_function.lambda_handler', // Points to the 'hello' file in the lambda directory
    });
    table.grantReadWriteData(helloFunctionADOTAuto);


    // https://aws-otel.github.io/docs/getting-started/lambda/lambda-python
    // const helloFunctionOtelCustom = new lambda.Function(this, `adot-custom-${props.arch}-${props.runtime}`, {
    //   runtime: props.runtime, // Choose any supported Python3 runtime
    //   code: lambda.Code.fromAsset('lib/otel-tests/python/adot-custom'), // Points to the lambda directory
    //   architecture: props.arch,
    //   memorySize: 1024,
    //   environment: {
    //     DDB_TABLE_NAME: table.tableName,
    //     FUNCTION_NAME: `${props.runtime}-${props.arch}`
    //   },
    //   layers: [],
    //   adotInstrumentation: {
    //     layerVersion: AdotLayerVersion.fromPythonSdkLayerVersion(AdotLambdaLayerPythonSdkVersion.LATEST),
    //     execWrapper: AdotLambdaExecWrapper.INSTRUMENT_HANDLER,
    //   },
    //   //tracing: lambda.Tracing.ACTIVE,
    //   handler: 'lambda_function.lambda_handler', // Points to the 'hello' file in the lambda directory
    // });
    // table.grantReadWriteData(helloFunctionOtelCustom);

  }
}