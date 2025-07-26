from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

import uuid
import json
import os
import shutil
import requests
from typing import List, Dict, Any

# Load environment variables
load_dotenv()

app = FastAPI()

# Firebase configuration
FIREBASE_DATABASE_URL = os.getenv(
    "FIREBASE_DATABASE_URL",
    "https://pulse-bengaluru-2933b-default-rtdb.firebaseio.com/",
)

print(f"🔥 Firebase Database URL: {FIREBASE_DATABASE_URL}")
print("✅ Firebase Realtime Database configured")

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

# Firestore collection name
REPORTS_COLLECTION = "reports"

# File & report config
REPORTS_FILE = "reports.json"
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def save_report_to_firebase(data: Dict[Any, Any]) -> bool:
    """Save report to Firebase Realtime Database"""
    try:
        # Use Firebase REST API to save data
        url = f"{FIREBASE_DATABASE_URL}/reports.json"
        response = requests.post(url, json=data)

        if response.status_code == 200:
            result = response.json()
            print(
                f"✅ Report saved to Firebase: {data['id']} (key: {result.get('name', 'unknown')})"
            )
            # Also save to JSON as backup
            save_report(data)
            return True
        else:
            print(f"❌ Firebase save failed: {response.status_code} - {response.text}")
            save_report(data)
            return False
    except Exception as e:
        print(f"❌ Error saving to Firebase: {e}")
        # Fallback to JSON
        save_report(data)
        return False


def get_reports_from_firebase() -> List[Dict[Any, Any]]:
    """Get reports from Firebase Realtime Database"""
    try:
        # Use Firebase REST API to get data
        url = f"{FIREBASE_DATABASE_URL}/reports.json"
        response = requests.get(url)

        if response.status_code == 200:
            data = response.json()

            if data:
                # Convert Firebase object format to list
                reports = []
                for key, value in data.items():
                    if isinstance(value, dict):
                        value["firebase_key"] = key  # Store Firebase key for reference
                        reports.append(value)

                # Sort by timestamp (newest first)
                reports.sort(key=lambda x: x.get("timestamp", ""), reverse=True)

                print(f"✅ Retrieved {len(reports)} reports from Firebase")
                return reports[:50]  # Limit to 50 most recent
            else:
                print("📝 No reports found in Firebase")
                return []
        else:
            print(f"❌ Firebase fetch failed: {response.status_code} - {response.text}")
            return load_reports()
    except Exception as e:
        print(f"❌ Error fetching from Firebase: {e}")
        # Fallback to JSON
        return load_reports()


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

        # Save to Firebase Realtime Database (with JSON fallback)
        firebase_success = save_report_to_firebase(new_item)

        return JSONResponse(
            content={
                "status": "success",
                "data": new_item,
                "firebase": "success" if firebase_success else "fallback_to_json",
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to submit report: {str(e)}"
        )


# 🔎 Fetch feed
@app.get("/feed")
async def get_feed():
    reports = get_reports_from_firebase()
    return {"status": "ok", "items": reports}


# 🔥 Get reports specifically from Firebase
@app.get("/feed/firebase")
async def get_feed_firebase():
    """Get reports directly from Firebase Realtime Database"""
    try:
        url = f"{FIREBASE_DATABASE_URL}/reports.json"
        response = requests.get(url)

        if response.status_code == 200:
            data = response.json()

            if data:
                reports = []
                for key, value in data.items():
                    if isinstance(value, dict):
                        value["firebase_key"] = key
                        reports.append(value)

                reports.sort(key=lambda x: x.get("timestamp", ""), reverse=True)

                return {
                    "status": "ok",
                    "source": "firebase",
                    "count": len(reports),
                    "items": reports[:50],
                }
            else:
                return {"status": "ok", "source": "firebase", "count": 0, "items": []}
        else:
            raise HTTPException(
                status_code=500, detail=f"Firebase error: {response.status_code}"
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Firebase error: {str(e)}")


# 📝 Get single report by ID
@app.get("/report/{report_id}")
async def get_report(report_id: str):
    """Get a specific report by ID from Firebase"""
    try:
        # First get all reports and find by ID
        url = f"{FIREBASE_DATABASE_URL}/reports.json"
        response = requests.get(url)

        if response.status_code == 200:
            data = response.json()

            if data:
                for key, value in data.items():
                    if isinstance(value, dict) and value.get("id") == report_id:
                        value["firebase_key"] = key
                        return {"status": "ok", "data": value}

                raise HTTPException(status_code=404, detail="Report not found")
            else:
                raise HTTPException(status_code=404, detail="No reports found")
        else:
            raise HTTPException(
                status_code=500, detail=f"Firebase error: {response.status_code}"
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching report: {str(e)}")


# 🗑️ Delete report by Firebase key
@app.delete("/report/firebase/{firebase_key}")
async def delete_report_by_key(firebase_key: str):
    """Delete a specific report by Firebase key"""
    try:
        url = f"{FIREBASE_DATABASE_URL}/reports/{firebase_key}.json"
        response = requests.delete(url)

        if response.status_code == 200:
            return {
                "status": "success",
                "message": f"Report with key {firebase_key} deleted",
            }
        else:
            raise HTTPException(
                status_code=500, detail=f"Firebase delete error: {response.status_code}"
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting report: {str(e)}")
