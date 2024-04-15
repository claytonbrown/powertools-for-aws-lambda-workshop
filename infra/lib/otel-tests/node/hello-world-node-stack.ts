import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import {
  Architecture,
  Runtime,
  AdotLambdaExecWrapper,
  AdotLayerVersion,
  AdotLambdaLayerJavaScriptSdkVersion,
} from 'aws-cdk-lib/aws-lambda';

export interface NodeHelloWorldProps {
  readonly arch: Architecture;
  readonly runtime: Runtime;
}

export class NodeHelloWorld extends Construct {
  constructor(scope: Construct, id: string, props: NodeHelloWorldProps) {
    super(scope, id);

    const table = new Table(scope, `ddb-otel-${props.runtime}-${props.arch}`, {
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      }
    })

    const helloFunctionBasic = new NodejsFunction(this, 'basic.function', {
      runtime: props.runtime,
      architecture: props.arch,
      memorySize: 1024,
      environment: {
        DDB_TABLE_NAME: table.tableName,
        FUNCTION_NAME: `${props.runtime}-${props.arch}`
      },
      layers: [],
      tracing: lambda.Tracing.DISABLED,
    });
    table.grantReadWriteData(helloFunctionBasic)

    const helloFunctionXRAYSDK = new NodejsFunction(this, 'xraysdk.function', {
      runtime: props.runtime,
      architecture: props.arch,
      memorySize: 1024,
      environment: {
        DDB_TABLE_NAME: table.tableName,
        FUNCTION_NAME: `${props.runtime}-${props.arch}`
      },
      layers: [],
      tracing: lambda.Tracing.DISABLED,
    });
    table.grantReadWriteData(helloFunctionXRAYSDK)


    const helloFunctionADOTAuto = new NodejsFunction(this, 'adot-auto.function', {
      runtime: props.runtime,
      architecture: props.arch,
      adotInstrumentation: {
        layerVersion: AdotLayerVersion.fromJavaScriptSdkLayerVersion(AdotLambdaLayerJavaScriptSdkVersion.LATEST),
        execWrapper: AdotLambdaExecWrapper.REGULAR_HANDLER,
      },
      memorySize: 1024,
      environment: {
        DDB_TABLE_NAME: table.tableName,
        FUNCTION_NAME: `${props.runtime}-${props.arch}`
      },
      layers: [],
      tracing: lambda.Tracing.DISABLED,
    });
    table.grantReadWriteData(helloFunctionADOTAuto)



    const helloFunctionOtelCustom = new NodejsFunction(this, 'adot-custom.function', {
      runtime: props.runtime,
      architecture: props.arch,
      memorySize: 1024,
      environment: {
        // Required for layer
        AWS_LAMBDA_EXEC_WRAPPER: '/opt/otel-handler',
        OPENTELEMETRY_COLLECTOR_CONFIG_FILE: '/var/task/collector.yaml',

        // Required to for HNY
        OTEL_PROPAGATORS: 'tracecontext',
        OTEL_SERVICE_NAME: 'hello-world-service',

        // Standard environment variable
        DDB_TABLE_NAME: table.tableName,
        FUNCTION_NAME: `${props.runtime}-${props.arch}`
      },
      layers: [
        // From https://github.com/aws-observability/aws-otel-lambda
        lambda.LayerVersion.fromLayerVersionArn(
          this,
          'otel-layer',
          'arn:aws:lambda:ap-southeast-2:901920570463:layer:aws-otel-nodejs-arm64-ver-1-7-0:2'
        ),
      ],
      // Ignores AWS Lambda services' OTEL traces
      tracing: lambda.Tracing.PASS_THROUGH,
      bundling: {
          keepNames: true,
          nodeModules: [
            // For Otel's auto-instrumentation to work the package must be in node modules
            // Packages that autoinstrumentation will work on https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-node
            '@aws-sdk/client-dynamodb',
          ],
          externalModules: [
            // Do not deploy, runtime function will use these values from the layer
            //  we have these deps in our package.json so that we can add
            //  OTel types to code + use honeycomb for local invokes of the lambda function
            '@opentelemetry/api',
            '@opentelemetry/sdk-node',
            '@opentelemetry/auto-instrumentations-node',
          ],
          commandHooks: {
              // AWS Otel lambda, this for otel configuration
              beforeBundling(inputDir: string, outputDir: string): string[] {
                return [`cp ${inputDir}/infra/lib/otel-tests/collector-template.yaml ${outputDir}`]
              },
              afterBundling(): string[] {
                return []
              },
              beforeInstall() {
                return []
              },
          },
      }
  });
  table.grantReadWriteData(helloFunctionOtelCustom)
  }
}
