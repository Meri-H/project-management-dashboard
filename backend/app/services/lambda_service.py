import json
import os

import boto3


lambda_client = boto3.client(
    "lambda",
    region_name=os.getenv("AWS_REGION"),
)


def process_project(project_name: str):
    payload = {
        "project_name": project_name,
    }

    response = lambda_client.invoke(
        FunctionName=os.getenv("AWS_LAMBDA_FUNCTION_NAME"),
        InvocationType="RequestResponse",
        Payload=json.dumps(payload).encode("utf-8"),
    )

    result = json.loads(
        response["Payload"].read()
    )

    return result