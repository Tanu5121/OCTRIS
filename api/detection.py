from fastapi import APIRouter, UploadFile, File
import shutil
import os

from ai.yolo_detector import detect_traffic


router = APIRouter(
    prefix="/detection",
    tags=["Detection"]
)


UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/")
async def detect_image(file: UploadFile = File(...)):

    # Save uploaded image
    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    # Send image to YOLO
    result = detect_traffic(file_path)

    # Return YOLO result
    return {
        "filename": file.filename,
        "detection": result
    }