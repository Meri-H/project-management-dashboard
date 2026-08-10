from pathlib import Path
from uuid import uuid4


UPLOAD_DIR = Path("uploads")


def save_file(file_bytes: bytes, filename: str, project_id: int) -> str:
    project_dir = UPLOAD_DIR / f"project_{project_id}"
    project_dir.mkdir(parents=True, exist_ok=True)

    unique_name = f"{uuid4()}_{filename}"
    file_path = project_dir / unique_name

    file_path.write_bytes(file_bytes)

    return str(file_path)


def delete_file(storage_key: str) -> None:
    file_path = Path(storage_key)

    if file_path.exists():
        file_path.unlink()


def read_file(storage_key: str) -> bytes:
    return Path(storage_key).read_bytes()