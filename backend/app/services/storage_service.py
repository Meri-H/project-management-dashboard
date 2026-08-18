import os
from uuid import uuid4

import boto3
from dotenv import load_dotenv


load_dotenv("backend/.env")

AWS_REGION = os.getenv("AWS_REGION")
AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET")

s3_client = boto3.client(
    "s3",
    region_name=AWS_REGION,
)


def save_file(
    file_bytes: bytes,
    filename: str,
    project_id: int,
) -> str:
    storage_key = (
        f"projects/{project_id}/documents/"
        f"{uuid4()}_{filename}"
    )

    s3_client.put_object(
        Bucket=AWS_S3_BUCKET,
        Key=storage_key,
        Body=file_bytes,
    )

    return storage_key


def read_file(storage_key: str) -> bytes:
    response = s3_client.get_object(
        Bucket=AWS_S3_BUCKET,
        Key=storage_key,
    )

    return response["Body"].read()


def delete_file(storage_key: str) -> None:
    s3_client.delete_object(
        Bucket=AWS_S3_BUCKET,
        Key=storage_key,
    )