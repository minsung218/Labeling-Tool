from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pathlib import Path

router = APIRouter(prefix="/api/dicom", tags=["dicom"])
BASE_DIR = Path(__file__).resolve().parent.parent / "static"

@router.get("/")
def get_dicom(file: str):
    """
    file: "folder/filename.dcm"
    반환: application/dicom 형태로 원본 바이트 스트리밍
    """
    path = BASE_DIR / file
    if not path.is_file():
        raise HTTPException(404, "DICOM 파일을 찾을 수 없습니다.")
    return StreamingResponse(path.open("rb"), media_type="application/dicom")