#!/usr/bin/env python3
"""
CleanSight Model Test Script
Provides a FastAPI API for YOLO detection
"""

import os
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from ultralytics import YOLO
from PIL import Image
import io
import base64
import tempfile
import traceback

try:
    from gradio_client import Client, handle_file
    HF_CLIENT = Client("adityanaulakha/CleanSight")
    print("✅ Hugging Face Gradio client initialized")
except Exception as e:
    HF_CLIENT = None
    print(f"⚠️ Could not initialize Hugging Face client: {e}")

# ✅ Create FastAPI app

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="CleanSight YOLO API")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Load YOLO model once
try:
    model = YOLO("best.pt")
    print("✅ YOLO model loaded successfully!")
except Exception as e:
    print(f"❌ Failed to load YOLO model: {e}")
    model = None

@app.get("/")
def root():
    return {"message": "🚀 CleanSight YOLO API is running!"}


# New /predict endpoint for frontend
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """Run YOLO detection and return result for frontend"""
    if not model:
        return {"success": False, "error": "Model not loaded"}

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        # Run inference
        results = model(image, conf=0.25)
        prediction = results[0]

        # Save annotated image
        annotated_path = "annotated.png"
        prediction.save(annotated_path)
        with open(annotated_path, "rb") as f:
            annotated_base64 = base64.b64encode(f.read()).decode("utf-8")

        # Collect detections and confidences
        garbage_confidences = []
        for box in prediction.boxes:
            cls_id = int(box.cls[0])
            confidence = float(box.conf[0])
            label = model.names[cls_id]
            # Assume 'garbage' is the class name for garbage
            if label.lower() in ["garbage", "waste", "trash"]:
                garbage_confidences.append(confidence)

        # If any garbage detected, use max confidence, else 0
        garbage_probability = max(garbage_confidences) if garbage_confidences else 0.0
        garbage_detected = garbage_probability > 0.5  # threshold can be tuned

        # For main result, use the highest confidence
        confidence = garbage_probability

        return {
            "success": True,
            "garbage_detected": garbage_detected,
            "confidence": round(confidence, 3),
            "garbage_probability": round(garbage_probability, 3),
            "annotated_image": annotated_base64,
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/hf_predict")
async def hf_predict(file: UploadFile = File(...)):
    """Proxy to Hugging Face Space (/predict_image) returning annotated image.
    This avoids CORS issues by calling from the backend using gradio_client.
    """
    if HF_CLIENT is None:
        return {"success": False, "error": "Hugging Face client not initialized on server"}
    try:
        contents = await file.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix="_upload.jpg") as tmp:
            tmp.write(contents)
            tmp_path = tmp.name
        # Call the space predict function
        print("🔄 Calling Hugging Face Space /predict_image with", tmp_path)
        result = HF_CLIENT.predict(image=handle_file(tmp_path), api_name="/predict_image")
        # result expected to be dict with path or url
        annotated_base64 = None
        if isinstance(result, dict):
            img_path = result.get("path") or result.get("url")
            if img_path:
                try:
                    if img_path.startswith("http"):
                        import requests
                        resp = requests.get(img_path)
                        if resp.ok:
                            annotated_base64 = base64.b64encode(resp.content).decode("utf-8")
                    else:
                        with open(img_path, "rb") as f:
                            annotated_base64 = base64.b64encode(f.read()).decode("utf-8")
                except Exception as ie:
                    print("⚠️ Failed to load annotated image from path/url:", ie)
        return {
            "success": True,
            "source": "huggingface",
            "garbage_detected": True,  # Space currently assumed to always return annotated detection
            "confidence": 1.0,
            "annotated_image": annotated_base64,
            "raw_result": result,
        }
    except Exception as e:
        traceback.print_exc()
        return {"success": False, "error": f"HF proxy error: {e}"}

# ✅ CLI mode
def test_model_inference():
    print("🔄 Testing model inference from script...")
    if not model:
        print("❌ Model not available")
        return

    uploads_dir = "uploads"
    if os.path.exists(uploads_dir):
        images = [f for f in os.listdir(uploads_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        if images:
            test_image = os.path.join(uploads_dir, images[0])
            print(f"📸 Running inference on {test_image}")
            results = model(test_image, conf=0.25)
            prediction = results[0]
            print(f"🔍 Detections: {len(prediction.boxes)}")
            for i, box in enumerate(prediction.boxes):
                cls_id = int(box.cls[0])
                confidence = float(box.conf[0])
                label = model.names[cls_id]
                print(f"  Detection {i+1}: {label} ({confidence:.2f})")
        else:
            print("📂 No test images found in uploads/")
    else:
        print("📂 uploads/ folder not found")

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting FastAPI server on http://localhost:5000 ...")
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)