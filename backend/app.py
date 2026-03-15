#!/usr/bin/env python3
"""
CleanSight YOLO API
FastAPI backend for garbage detection
"""

import io
import base64
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image

# Create FastAPI app
app = FastAPI(title="CleanSight YOLO API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLO model once
try:
    model = YOLO("best.pt")
    print("✅ YOLO model loaded successfully!")
except Exception as e:
    print(f"❌ Failed to load YOLO model: {e}")
    model = None


@app.get("/")
def root():
    return {"message": "🚀 CleanSight YOLO API is running!"}


# Prediction endpoint
@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    if not model:
        return {"success": False, "error": "Model not loaded"}

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        # Run YOLO inference
        results = model(image, conf=0.25)
        prediction = results[0]

        # Convert annotated image directly to base64 (faster)
        annotated_image = prediction.plot()
        pil_image = Image.fromarray(annotated_image)

        buffer = io.BytesIO()
        pil_image.save(buffer, format="PNG")
        annotated_base64 = base64.b64encode(buffer.getvalue()).decode()

        # Collect garbage detections
        garbage_confidences = []

        for box in prediction.boxes:
            cls_id = int(box.cls[0])
            confidence = float(box.conf[0])
            label = model.names[cls_id]

            if label.lower() in ["garbage", "waste", "trash"]:
                garbage_confidences.append(confidence)

        garbage_probability = max(garbage_confidences) if garbage_confidences else 0.0
        garbage_detected = garbage_probability > 0.5

        return {
            "success": True,
            "garbage_detected": garbage_detected,
            "confidence": round(garbage_probability, 3),
            "annotated_image": annotated_base64,
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
