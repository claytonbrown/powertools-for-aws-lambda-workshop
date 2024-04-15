import os
import json
import boto3
import requests
from aws_lambda_powertools import Tracer
from aws_lambda_powertools.utilities.typing import LambdaContext

s3 = boto3.resource("s3")

tracer = Tracer()  # Sets service via POWERTOOLS_SERVICE_NAME env var
# OR tracer = Tracer(service="example")

# https://docs.powertools.aws.dev/lambda/python/latest/core/tracer/#patching-modules
# MODULES = ["requests"]
# tracer = Tracer(patch_modules=MODULES)

# lambda function - https://docs.powertools.aws.dev/lambda/python/latest/core/tracer/#permissions

@tracer.capture_method
def do_something(name):
    print(name)

@tracer.capture_lambda_handler
def lambda_handler(event: dict, context: LambdaContext):

    requests.get("http://aws.amazon.com/")

    for bucket in s3.buckets.all():
        do_something(bucket.name)

    return {"statusCode": 200, "body": json.dumps(os.environ.get("_X_AMZN_TRACE_ID"))}
