from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import SessionLocal
from ..models import Label, File
from ..schemas import LabelCreate, LabelResponse, LabelUpdate

router = APIRouter(prefix="/api/labels", tags=["labels"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=LabelResponse, status_code=status.HTTP_201_CREATED)
def create_label(data: LabelCreate, db: Session = Depends(get_db)):
    # 파일 메타 확인
    file_meta = db.query(File)\
                  .filter_by(filename=data.filename, sop_instance=data.sop_instance)\
                  .first()
    if not file_meta:
        raise HTTPException(404, "파일 메타데이터를 찾을 수 없습니다.")
    lbl = Label(
        file_id      = file_meta.id,
        label        = data.label,
        x            = data.x,
        y            = data.y,
        width        = data.width,
        height       = data.height
    )
    db.add(lbl)
    db.commit()
    db.refresh(lbl)
    return LabelResponse(
    id           = lbl.id,
    filename     = file_meta.filename,
    sop_instance = file_meta.sop_instance,
    label        = lbl.label,
    x            = lbl.x,
    y            = lbl.y,
    width        = lbl.width,
    height       = lbl.height
    )

@router.get("/", response_model=List[LabelResponse])
def read_labels(filename: str, sop_instance: str, db: Session = Depends(get_db)):
    # 파일 메타 조회
    file_meta = db.query(File)\
                  .filter_by(filename=filename, sop_instance=sop_instance)\
                  .first()
    if not file_meta:
        return []
    labels = db.query(Label)\
               .filter_by(file_id=file_meta.id)\
               .all()
    # 응답 시에는 filename, sop_instance 필드도 포함되도록 매핑
    return [
        LabelResponse(
            id           = l.id,
            filename     = filename,
            sop_instance = sop_instance,
            label        = l.label,
            x            = l.x,
            y            = l.y,
            width        = l.width,
            height       = l.height
        )
        for l in labels
    ]

@router.patch("/{label_id}", response_model=LabelResponse, status_code=status.HTTP_200_OK)
def update_label(label_id: int, data: LabelUpdate, db: Session = Depends(get_db)):
    lbl = db.get(Label, label_id)
    if not lbl:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "라벨을 찾을 수 없습니다.")
    update_data = data.dict(exclude_unset=True)
    for key, val in update_data.items():
        setattr(lbl, key, val)
    db.commit()
    db.refresh(lbl)
    # 연동된 File 메타를 읽어서 filename/sop_instance 포함 응답
    file_meta = lbl.file
    return LabelResponse(
        id           = lbl.id,
        filename     = file_meta.filename,
        sop_instance = file_meta.sop_instance,
        label        = lbl.label,
        x            = lbl.x,
        y            = lbl.y,
        width        = lbl.width,
        height       = lbl.height
    )

@router.delete("/{label_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_label(label_id: int, db: Session = Depends(get_db)):
    lbl = db.get(Label, label_id)
    if not lbl:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "라벨을 찾을 수 없습니다.")
    db.delete(lbl)
    db.commit()
    return
