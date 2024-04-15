import boto3
import json

client = boto3.client("lambda")

test_plan = []
fn_prefix =  "lambda-otel-test-"
test_strategies = ['speed'] # ['cost','speed','memory']
power_values = [128,256,512,1024,1536,3008]
parallel_invocation = True
payload = {
  "key1": "value1",
  "key2": "value2",
  "key3": "value3"
}

for fn in client.list_functions()['Functions']:
  fn_arn = fn['FunctionArn']

  if fn_prefix in fn_arn:
    fn_name = fn_arn.split(fn_prefix)[1].split('function')[0]

    for strategy in test_strategies:
      test_plan = f"./input/execution-input-{fn_name}-{strategy}.json"

      # https://github.com/alexcasalboni/aws-lambda-power-tuning
      test = {
          # 'preProcessorARN': 'TODO',
          'lambdaARN': fn_arn,
          # 'postProcessorARN': 'TODO',
          'powerValues': power_values,
          'payload': payload,
          'num': 10,
          'parallelInvocation': parallel_invocation,
          'strategy': strategy,
          'includeOutputResults': True,
          'discardTopBottom': 0.2,
      }
      with open(test_plan, 'w') as f:
        f.write(json.dumps(test,indent=2))
        f.close()
        print(f"Written: {test_plan}")