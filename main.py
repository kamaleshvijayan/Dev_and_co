from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from ultralytics import YOLO
import cv2
import numpy as np
import io
import time
import os
from typing import List, Optional
import uuid
from datetime import datetime

app = FastAPI(title="Crack Detection API", version="1.0.0")

# Load trained YOLO model
model = None
CONF_THRESHOLD = 0.5

@app.on_event("startup")
async def startup_event():
    """Initialize the model on startup"""
    global model
    try:
        model = YOLO("crack.pt")
        print("✅ Model loaded with classes:", model.names)
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        raise

def process_image(image_bytes: bytes) -> dict:
    """Process image and detect cracks"""
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    # Convert bytes to numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if frame is None:
        raise HTTPException(status_code=400, detail="Invalid image format")
    
    # Run YOLO detection
    results = model.predict(frame, conf=0.25)
    annotated_frame = results[0].plot()
    
    # Process detections
    detections = []
    crack_detected = False
    
    for box in results[0].boxes:
        cls_id = int(box.cls[0])
        cls_name = model.names[cls_id]
        conf = float(box.conf[0])
        bbox = box.xyxy[0].tolist()  # [x1, y1, x2, y2]
        
        detection = {
            "class": cls_name,
            "confidence": conf,
            "bbox": bbox,
            "timestamp": datetime.now().isoformat()
        }
        detections.append(detection)
        
        if cls_name.lower() == "crack" and conf >= CONF_THRESHOLD:
            crack_detected = True
    
    # Convert annotated frame to bytes
    _, encoded_image = cv2.imencode(".jpg", annotated_frame)
    annotated_image_bytes = encoded_image.tobytes()
    
    return {
        "detections": detections,
        "crack_detected": crack_detected,
        "annotated_image": annotated_image_bytes,
        "total_detections": len(detections)
    }

@app.post("/detect-cracks/")
async def detect_cracks(file: UploadFile = File(...)):
    """Detect cracks in uploaded image"""
    try:
        # Read uploaded file
        image_bytes = await file.read()
        
        # Process image
        result = process_image(image_bytes)
        
        # Save if crack detected
        if result["crack_detected"]:
            filename = f"crack_detection_{uuid.uuid4().hex[:8]}.jpg"
            with open(filename, "wb") as f:
                f.write(result["annotated_image"])
            result["saved_filename"] = filename
        
        # Return JSON response without image (to keep response small)
        response_data = {
            "crack_detected": result["crack_detected"],
            "detections": result["detections"],
            "total_detections": result["total_detections"],
            "timestamp": datetime.now().isoformat()
        }
        
        if "saved_filename" in result:
            response_data["saved_filename"] = result["saved_filename"]
        
        return JSONResponse(content=response_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@app.post("/detect-cracks-with-image/")
async def detect_cracks_with_image(file: UploadFile = File(...)):
    """Detect cracks and return annotated image"""
    try:
        image_bytes = await file.read()
        result = process_image(image_bytes)
        
        # Return annotated image as response
        return StreamingResponse(
            io.BytesIO(result["annotated_image"]),
            media_type="image/jpeg",
            headers={
                "X-Crack-Detected": str(result["crack_detected"]).lower(),
                "X-Total-Detections": str(result["total_detections"])
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/model-info")
async def model_info():
    """Get model information"""
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    return {
        "classes": model.names,
        "confidence_threshold": CONF_THRESHOLD,
        "model_type": str(type(model))
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
