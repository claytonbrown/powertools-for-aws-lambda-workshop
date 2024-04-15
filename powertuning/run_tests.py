import boto3
import json
import os

OVERWRITE = False


client = boto3.client("lambda")
session = aioboto3.Session()


test_plan = []
fn_prefix =  "lambda-otel-test-"
test_strategies = ['cost','speed','memory']
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
      test_plan = f"./input/{fn_name}-{strategy}.json"

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
      if OVERWRITE or not os.path.isfile(test_plan):
        with open(test_plan, 'w') as f:
          f.write(json.dumps(test,indent=2))
          f.close()
          print(f"Written: {test_plan}")

async def main():

    async with session.resource("s3") as s3:
        bucket = await s3.Bucket('mybucket')  # <----------------
        async for s3_object in bucket.objects.all():
            print(s3_object)
