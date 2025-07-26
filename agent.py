import google.generativeai as genai
import json
import requests
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import json
import requests
import google.generativeai as genai
import hashlib
import datetime
import argparse

load_dotenv()

app = Flask(__name__)
CORS(app)

# Firebase configuration
FIREBASE_DATABASE_URL = os.getenv(
    "FIREBASE_DATABASE_URL",
    "https://pulse-bengaluru-2933b-default-rtdb.firebaseio.com/",
)


def fetch_firebase_data():
    """
    Fetch 2 items each from all three Firebase collections
    """
    collections = ["btp_traffic_news", "reddit_reports", "citizen_matters_articles"]

    all_data = {
        "btp_traffic_news": [],
        "reddit_reports": [],
        "citizen_matters_articles": [],
    }

    for collection in collections:
        try:
            url = f"{FIREBASE_DATABASE_URL}/{collection}.json"
            response = requests.get(url, timeout=10)

            if response.status_code == 200:
                data = response.json()
                if data:
                    # Convert Firebase data to list and get first 2 items
                    items = list(data.values()) if isinstance(data, dict) else data
                    all_data[collection] = items[:2]  # Get only 2 items
                    print(
                        f"✅ Fetched {len(all_data[collection])} items from {collection}"
                    )
                else:
                    print(f"📭 No data in {collection}")
            else:
                print(f"❌ Failed to fetch {collection}: {response.status_code}")

        except Exception as e:
            print(f"❌ Error fetching {collection}: {e}")

    total_items = sum(len(items) for items in all_data.values())
    print(f"📊 Total items fetched: {total_items}")
    return all_data


def store_alerts_to_firebase(alerts):
    """
    Store generated alerts to Firebase alerts collection
    """
    try:
        url = f"{FIREBASE_DATABASE_URL}/alerts.json"

        for alert in alerts:
            # Add timestamp and unique ID
            alert["created_at"] = datetime.datetime.now().isoformat()
            alert["id"] = hashlib.md5(
                (alert["title"] + alert["description"]).encode()
            ).hexdigest()[:8]

            # Store each alert individually
            alert_url = f"{FIREBASE_DATABASE_URL}/alerts/{alert['id']}.json"
            response = requests.put(alert_url, json=alert, timeout=10)

            if response.status_code == 200:
                print(f"✅ Stored alert: {alert['title'][:50]}...")
            else:
                print(f"❌ Failed to store alert: {response.status_code}")

        print(f"📊 Stored {len(alerts)} alerts to Firebase")
        return True

    except Exception as e:
        print(f"❌ Error storing alerts to Firebase: {e}")
        return False


def generate_multiple_alerts(firebase_data):
    """
    Generate alerts using 3 separate prompts to Gemini, 2 alerts each
    """
    all_alerts = []

    # Prompt 1: Traffic and Infrastructure
    traffic_data = firebase_data.get("btp_traffic_news", []) + firebase_data.get(
        "reddit_reports", []
    )
    if traffic_data:
        traffic_prompt = f"""
        Based on the following traffic and infrastructure data from Bengaluru, generate EXACTLY 2 concise alerts for citizens.
        Focus on traffic conditions, road closures, and transportation issues.
        
        Data: {json.dumps(traffic_data, indent=2)}
        
        Return response as valid JSON array with this format:
        [
          {{"title": "Alert title (max 80 chars)", "description": "Brief description (max 150 chars)", "type": "urgent|warning|info"}},
          {{"title": "Alert title (max 80 chars)", "description": "Brief description (max 150 chars)", "type": "urgent|warning|info"}}
        ]
        """

        traffic_alerts = call_gemini(traffic_prompt)
        try:
            parsed_alerts = json.loads(
                traffic_alerts.strip().replace("```json", "").replace("```", "")
            )
            all_alerts.extend(parsed_alerts[:2])  # Ensure only 2 alerts
        except json.JSONDecodeError:
            print("❌ Failed to parse traffic alerts")

    # Prompt 2: Citizen Issues and Reports
    citizen_data = firebase_data.get(
        "citizen_matters_articles", []
    ) + firebase_data.get("reddit_reports", [])
    if citizen_data:
        citizen_prompt = f"""
        Based on the following citizen reports and local news from Bengaluru, generate EXACTLY 2 concise alerts.
        Focus on public services, local issues, and community concerns.
        
        Data: {json.dumps(citizen_data, indent=2)}
        
        Return response as valid JSON array with this format:
        [
          {{"title": "Alert title (max 80 chars)", "description": "Brief description (max 150 chars)", "type": "urgent|warning|info"}},
          {{"title": "Alert title (max 80 chars)", "description": "Brief description (max 150 chars)", "type": "urgent|warning|info"}}
        ]
        """

        citizen_alerts = call_gemini(citizen_prompt)
        try:
            parsed_alerts = json.loads(
                citizen_alerts.strip().replace("```json", "").replace("```", "")
            )
            all_alerts.extend(parsed_alerts[:2])  # Ensure only 2 alerts
        except json.JSONDecodeError:
            print("❌ Failed to parse citizen alerts")

    # Prompt 3: Combined Analysis and Recommendations
    combined_data = []
    for collection_data in firebase_data.values():
        combined_data.extend(collection_data)

    if combined_data:
        combined_prompt = f"""
        Based on analyzing ALL the following data sources together, generate EXACTLY 2 strategic alerts.
        Look for patterns, correlations, and important insights across traffic, citizen reports, and news.
        
        Data: {json.dumps(combined_data, indent=2)}
        
        Return response as valid JSON array with this format:
        [
          {{"title": "Alert title (max 80 chars)", "description": "Brief description (max 150 chars)", "type": "urgent|warning|info"}},
          {{"title": "Alert title (max 80 chars)", "description": "Brief description (max 150 chars)", "type": "urgent|warning|info"}}
        ]
        """

        combined_alerts = call_gemini(combined_prompt)
        try:
            parsed_alerts = json.loads(
                combined_alerts.strip().replace("```json", "").replace("```", "")
            )
            all_alerts.extend(parsed_alerts[:2])  # Ensure only 2 alerts
        except json.JSONDecodeError:
            print("❌ Failed to parse combined alerts")

    print(f"📊 Generated {len(all_alerts)} total alerts")
    return all_alerts


def call_gemini(prompt):
    genai.configure(api_key="AIzaSyCzz9R9NyG-hwqTOqLJ7zzbjmQnxTSxMRI")
    model = genai.GenerativeModel(model_name="gemini-2.5-flash")

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating alerts: {str(e)}"


def generate_alerts(json_data):
    """
    Generate combined alerts based on various data sources using Gemini AI

    Args:
        json_data: Dictionary or list containing news articles, traffic data, and other contextual information

    Returns:
        Generated alerts text from Gemini
    """

    # Convert json_data to string if it's not already
    if isinstance(json_data, (dict, list)):
        json_str = json.dumps(json_data, indent=2)
    else:
        json_str = str(json_data)

    prompt = f"""
    Based on the following JSON data containing news articles, traffic information, and citizen reports, 
    please generate 3-6 concise alerts that would be useful for citizens. Each alert should have:
    
    1. A clear, actionable title (max 80 characters)
    2. A brief description (max 150 characters)
    3. A type: either "urgent", "warning", or "info"
    
    Focus on:
    - Combining insights from multiple data sources when relevant
    - Being actionable and practical for citizens
    - Highlighting urgent or time-sensitive issues
    - Consider traffic, weather, and public service disruptions
    
    JSON Data:
    {json_str}
    
    Return the response as a valid JSON array with this exact format:
    [
      {{
        "title": "Alert title here",
        "description": "Brief description here",
        "type": "urgent|warning|info"
      }},
      ...
    ]
    
    Make sure the response is valid JSON only, no additional text.
    """

    response = call_gemini(prompt)

    # Try to parse the JSON response
    try:
        # Clean the response to extract just the JSON part
        response_cleaned = response.strip()
        if response_cleaned.startswith("```json"):
            response_cleaned = (
                response_cleaned.replace("```json", "").replace("```", "").strip()
            )

        alerts = json.loads(response_cleaned)

        # Add unique IDs to each alert
        for i, alert in enumerate(alerts):
            alert["id"] = f"alert_{i}_{hash(alert.get('title', ''))}"

        return alerts
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing JSON response: {e}")
        print(f"Raw response: {response}")
        # Return fallback alerts
        return [
            {
                "title": "Data Processing Alert",
                "description": "City data is being processed. Check back for updates.",
                "type": "info",
                "id": "fallback_1",
            }
        ]


@app.route("/api/start-agent", methods=["POST"])
def start_agent():
    """
    API endpoint to start the agent: fetch data, generate alerts, and store to Firebase
    """
    try:
        print("🚀 Starting agent process...")

        # Step 1: Fetch data from Firebase
        firebase_data = fetch_firebase_data()

        if not any(firebase_data.values()):
            return jsonify(
                {
                    "success": False,
                    "message": "No data available from Firebase collections",
                    "alerts_generated": 0,
                }
            )

        # Step 2: Generate alerts using 3 prompts
        alerts = generate_multiple_alerts(firebase_data)

        if not alerts:
            return jsonify(
                {
                    "success": False,
                    "message": "Failed to generate alerts",
                    "alerts_generated": 0,
                }
            )

        # Step 3: Store alerts to Firebase
        success = store_alerts_to_firebase(alerts)

        return jsonify(
            {
                "success": success,
                "message": f"Agent completed successfully. Generated {len(alerts)} alerts.",
                "alerts_generated": len(alerts),
                "data_sources": {
                    "btp_traffic_news": len(firebase_data.get("btp_traffic_news", [])),
                    "reddit_reports": len(firebase_data.get("reddit_reports", [])),
                    "citizen_matters_articles": len(
                        firebase_data.get("citizen_matters_articles", [])
                    ),
                },
            }
        )

    except Exception as e:
        print(f"❌ Error in agent process: {e}")
        return (
            jsonify(
                {
                    "success": False,
                    "message": f"Agent failed: {str(e)}",
                    "alerts_generated": 0,
                }
            ),
            500,
        )


@app.route("/api/alerts", methods=["GET"])
def get_alerts():
    """
    API endpoint to fetch alerts from Firebase
    """
    try:
        url = f"{FIREBASE_DATABASE_URL}/alerts.json"
        response = requests.get(url, timeout=10)

        if response.status_code == 200:
            data = response.json()
            if data:
                # Convert Firebase data to list and sort by creation time
                alerts = list(data.values())
                alerts.sort(key=lambda x: x.get("created_at", ""), reverse=True)

                return jsonify(
                    {"success": True, "alerts": alerts, "count": len(alerts)}
                )
            else:
                return jsonify({"success": True, "alerts": [], "count": 0})
        else:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": f"Failed to fetch alerts: {response.status_code}",
                        "alerts": [],
                    }
                ),
                500,
            )

    except Exception as e:
        print(f"❌ Error fetching alerts: {e}")
        return (
            jsonify(
                {
                    "success": False,
                    "message": f"Failed to fetch alerts: {str(e)}",
                    "alerts": [],
                }
            ),
            500,
        )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pulse Bengaluru Alert Generator")
    parser.add_argument("--server", action="store_true", help="Run as Flask server")
    parser.add_argument(
        "--test", action="store_true", help="Test alert generation with sample data"
    )

    args = parser.parse_args()

    if args.server:
        print("🚀 Starting Flask server...")
        app.run(host="0.0.0.0", port=5000, debug=True)
    elif args.test:
        print("🧪 Testing alert generation...")
        firebase_data = fetch_firebase_data()
        alerts = generate_multiple_alerts(firebase_data)
        print(f"Generated {len(alerts)} alerts:")
        for alert in alerts:
            print(f"- {alert.get('title', 'No title')}")
    else:
        print("Use --server to run Flask server or --test to test alert generation")
        print("Example: python agent.py --server")
