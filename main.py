from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
from fastapi.staticfiles import StaticFiles

import uuid
import json
import os
import shutil

app = FastAPI()

# ✅ Mount static files early on
app.mount("/static", StaticFiles(directory="."), name="static")
# CORS setup
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use exact frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# File & report config
REPORTS_FILE = "reports.json"
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def load_reports():
    if not os.path.exists(REPORTS_FILE):
        return []
    with open(REPORTS_FILE, "r") as f:
        return json.load(f)


def save_report(data):
    reports = load_reports()
    reports.insert(0, data)  # Add newest to top
    with open(REPORTS_FILE, "w") as f:
        json.dump(reports[:50], f, indent=2)  # Keep latest 50 entries


# 🔁 Submit report with image
@app.post("/submit")
async def submit_report(
    media: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    type: str = Form(...),
    city: str = Form(...),
    area: str = Form(...),
    lat: str = Form(""),
    lng: str = Form(""),
):
    try:
        # Save uploaded image
        media_filename = f"{media.filename}"
        media_path = os.path.join(UPLOAD_FOLDER, media_filename)
        with open(media_path, "wb") as buffer:
            shutil.copyfileobj(media.file, buffer)

        # Construct new report
        new_item = {
            "id": str(uuid.uuid4()),
            "type": type,
            "title": title,
            "description": f"{description} (📍 {city}, {area})",
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "priority": "medium",  # Could adjust based on context
            "location": location,
            "lat": lat,
            "lng": lng,
            "media": media_path,
        }

        save_report(new_item)
        return JSONResponse(content={"status": "success", "data": new_item})

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to submit report: {str(e)}"
        )


# 🔎 Fetch feed
@app.get("/feed")
async def get_feed():
    return {"status": "ok", "items": load_reports()}
