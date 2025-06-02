from pydantic import BaseModel

class FileCreate(BaseModel):
    filename: str
    sop_instance: str

class FileResponse(FileCreate):
    id: int

    class Config:
        orm_mode = True

class LabelCreate(BaseModel):
    filename:     str
    sop_instance: str
    label:        str
    x:            int
    y:            int
    width:        int
    height:       int

class LabelUpdate(BaseModel):
    label:  str | None = None
    x:      int | None = None
    y:      int | None = None
    width:  int | None = None
    height: int | None = None

    class Config:
        orm_mode = True

class LabelResponse(LabelCreate):
    id: int

    class Config:
        orm_mode = True

class ReportCreate(BaseModel):
    content: str

class ReportResponse(BaseModel):
    id:           int
    file_id:      int
    sop_instance: str
    content:      str
    class Config:
        orm_mode = True