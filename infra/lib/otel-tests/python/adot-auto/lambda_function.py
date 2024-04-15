import os
import json
import boto3
import requests

s3 = boto3.resource("s3")


def do_something(name):
    print(name)


# lambda function
def lambda_handler(event, context):

    requests.get("http://aws.amazon.com/")

    for bucket in s3.buckets.all():
        do_something(bucket.name)

    return {"statusCode": 200, "body": json.dumps(os.environ.get("_X_AMZN_TRACE_ID"))}
