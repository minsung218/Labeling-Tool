from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from .database import engine, Base
from .models import File, Label
from .routers.files import router as files_router
from .routers.dicom import router as dicom_router
from .routers.labels import router as labels_router
from .routers.reports import router as reports_router

app = FastAPI(title="DICOM Labeling API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# DB 테이블 자동 생성
Base.metadata.create_all(bind=engine)

# static 폴더 준비
HERE = Path(__file__).resolve().parent
STATIC_DIR = HERE / "static"
STATIC_DIR.mkdir(parents=True, exist_ok=True)

# static 파일 서빙
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# 라우터 등록: files → dicom → labels -> reports
app.include_router(files_router)
app.include_router(dicom_router)
app.include_router(labels_router)
app.include_router(reports_router)
