from fastapi import APIRouter, HTTPException, UploadFile, File, Query, Depends
from sqlalchemy.orm import Session
import pydicom

from pathlib import Path
from typing import List, Dict

from ..database import SessionLocal
from ..models import File as FileModel
from ..schemas import FileResponse

router = APIRouter(prefix="/api/files", tags=["files"])
BASE_DIR = Path(__file__).resolve().parent.parent / "static"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("", response_model=List[Dict[str, str]])
def list_files(
    folder: str = Query("", alias="folder")
):
    """
    static/ 아래 folder 디렉터리의 하위 폴더 및 .dcm 파일 목록 조회
    """
    target = BASE_DIR / folder
    if not target.exists() or not target.is_dir():
        raise HTTPException(404, "폴더를 찾을 수 없습니다.")
    entries: List[Dict[str, str]] = []
    for p in sorted(target.iterdir(), key=lambda p: (not p.is_dir(), p.name.lower())):
        if p.is_dir():
            entries.append({"name": p.name, "type": "directory"})
        elif p.suffix.lower() == ".dcm":
            entries.append({"name": p.name, "type": "file"})
    return entries

@router.post("/upload", response_model=Dict[str, List[str]])
async def upload_files(
    files: List[UploadFile] = File(...),
    db:    Session          = Depends(get_db)
):
    """
    webkitdirectory로 받은 상대경로를 그대로 보존하며
    DICOM 파일(.dcm)을 static/... 에 저장
    업로드 시점에 SOP Instance UID를 추출하여 File 테이블에 메타 저장
    """
    saved: List[str] = []
    for up in files:
        rel  = Path(up.filename)
        dest = BASE_DIR / rel
        dest.parent.mkdir(parents=True, exist_ok=True)

        content = await up.read()
        with open(dest, "wb") as f:
            f.write(content)
        saved.append(rel.as_posix())

        # UID 추출 & 메타데이터 저장
        try:
            ds  = pydicom.dcmread(dest, stop_before_pixels=True)
            uid = ds.SOPInstanceUID
        except Exception:
            continue

        exists = db.query(FileModel)\
                   .filter_by(filename=rel.name, sop_instance=uid)\
                   .first()
        if not exists:
            file_meta = FileModel(filename=rel.name, sop_instance=uid)
            db.add(file_meta)
            db.commit()

    return {"saved": saved}
