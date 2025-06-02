from database import engine, Base
from routers import files, labels  # models import 트리거

# Base.metadata.drop_all(engine)  # 위험: 모든 테이블 삭제
Base.metadata.drop_all(bind=engine, tables=[labels.models.__table__, files.models.__table__])
Base.metadata.create_all(bind=engine)
