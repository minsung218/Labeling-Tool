import os
from pathlib import Path
from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 1. 현재 파일(__file__)이 있는 디렉터리(=backend) 기준으로 .env 로드
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

# 2. 환경변수에서 DATABASE_URL 읽기
DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    print(">>> FAILED to load .env at", env_path)
    raise RuntimeError("DATABASE_URL 환경변수가 설정되지 않았습니다!")

# 3. SQLAlchemy 엔진 생성 (echo=True → SQL 로깅)
engine = create_engine(DB_URL, echo=True)

# 4. 세션 팩토리
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 5. Base 선언 (모델 정의를 위한 부모)
Base = declarative_base()
