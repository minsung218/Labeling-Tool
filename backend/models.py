from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from .database import Base

class File(Base):
    __tablename__ = "files"

    id           = Column(Integer, primary_key=True, index=True)
    filename     = Column(String, index=True)
    sop_instance = Column(String, index=True)

    __table_args__ = (
        UniqueConstraint("filename", "sop_instance", name="uq_file_name_uid"),
    )

    # ORM 레벨에서 File → Label (1:N) 관계
    labels = relationship(
        "Label",
        back_populates="file",
        cascade="all, delete-orphan",
    )

    # ORM 레벨에서 File → Report (1:1) 관계
    report = relationship(
        "Report",
        back_populates="file",
        uselist=False,
        cascade="all, delete-orphan"
    )

class Label(Base):
    __tablename__ = "labels"

    id           = Column(Integer, primary_key=True, index=True)
    file_id      = Column(Integer, ForeignKey("files.id", ondelete="CASCADE"), index=True)
    label        = Column(String)
    x            = Column(Integer)
    y            = Column(Integer)
    width        = Column(Integer)
    height       = Column(Integer)

    # ORM 레벨에서 Label → File (N:1) 관계
    file = relationship("File", back_populates="labels")

class Report(Base):
    __tablename__ = "reports"

    id       = Column(Integer, primary_key=True, index=True)
    file_id  = Column(Integer, ForeignKey("files.id", ondelete="CASCADE"), unique=True, index=True)
    content  = Column(String, nullable=False)
     

    # ORM 레벨에서 Report → File (1:1) 관계
    file = relationship(
        "File",
        back_populates="report",
        uselist=False
    )