from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any

from ..database import SessionLocal
from ..models import Report, File
from ..schemas import ReportCreate, ReportResponse

router = APIRouter(prefix="/api/reports", tags=["reports"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/{sop_instance}", response_model=ReportResponse)
def read_report(sop_instance: str, db: Session = Depends(get_db)):
    # 1) 파일 메타 조회
    file_meta = db.query(File).filter_by(sop_instance=sop_instance).first()
    if not file_meta:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "해당 DICOM 파일 메타데이터를 찾을 수 없습니다.")
    # 2) 소견서 조회
    report = db.query(Report).filter_by(file_id=file_meta.id).first()
    if not report:
        # 소견서 레코드가 없으면 빈 content로 응답
        return ReportResponse(
            id           = 0,
            file_id      = file_meta.id,
            sop_instance = file_meta.sop_instance,
            content      = ""
        )
    return ReportResponse(
        id           = report.id,
        file_id      = report.file_id,
        sop_instance = file_meta.sop_instance,
        content      = report.content
    )

@router.post("/{sop_instance}", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def upsert_report(sop_instance: str, data: ReportCreate, db: Session = Depends(get_db)):
    # 1) 파일 메타 확인
    file_meta = db.query(File).filter_by(sop_instance=sop_instance).first()
    if not file_meta:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "해당 DICOM 파일 메타데이터를 찾을 수 없습니다.")
    # 2) upsert 처리: 이미 있으면 update, 없으면 insert
    report = db.query(Report).filter_by(file_id=file_meta.id).first()
    if report:
        report.content = data.content
    else:
        report = Report(
            file_id = file_meta.id,
            content = data.content
        )
        db.add(report)
    db.commit()
    db.refresh(report)
    return ReportResponse(
        id           = report.id,
        file_id      = report.file_id,
        sop_instance = file_meta.sop_instance,
        content      = report.content
    )
