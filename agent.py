import google.generativeai as genai
import json
import requests
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
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
    Fetch 2 items each from all Firebase collections including forecast data
    """
    collections = [
        "btp_traffic_news",
        "reddit_reports",
        "citizen_matters_articles",
        "forecast",
    ]

    all_data = {
        "btp_traffic_news": [],
        "reddit_reports": [],
        "citizen_matters_articles": [],
        "forecast": [],
    }

    for collection in collections:
        try:
            url = f"{FIREBASE_DATABASE_URL}/{collection}.json"
            response = requests.get(url, timeout=10)

            if response.status_code == 200:
                data = response.json()
                if data:
                    # Convert Firebase data to list and get first 2 items (or all for forecast)
                    items = list(data.values()) if isinstance(data, dict) else data
                    if collection == "forecast":
                        all_data[collection] = items  # Get all forecast items
                    else:
                        all_data[collection] = items[
                            :2
                        ]  # Get only 2 items for other collections
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
    Generate alerts using 4 separate prompts to Gemini, including forecast data
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

    # Prompt 3: Forecast-based Alerts
    forecast_data = firebase_data.get("forecast", [])
    if forecast_data:
        forecast_prompt = f"""
        Based on the following upcoming events and forecast data from Bengaluru, generate EXACTLY 2 proactive alerts.
        Focus on expected traffic patterns, crowd management, and event-related impacts.
        
        Data: {json.dumps(forecast_data, indent=2)}
        
        Return response as valid JSON array with this format:
        [
          {{"title": "Alert title (max 80 chars)", "description": "Brief description (max 150 chars)", "type": "urgent|warning|info"}},
          {{"title": "Alert title (max 80 chars)", "description": "Brief description (max 150 chars)", "type": "urgent|warning|info"}}
        ]
        """

        forecast_alerts = call_gemini(forecast_prompt)
        try:
            parsed_alerts = json.loads(
                forecast_alerts.strip().replace("```json", "").replace("```", "")
            )
            all_alerts.extend(parsed_alerts[:2])  # Ensure only 2 alerts
        except json.JSONDecodeError:
            print("❌ Failed to parse forecast alerts")

    # Prompt 4: Combined Analysis and Recommendations
    combined_data = []
    for collection_data in firebase_data.values():
        combined_data.extend(collection_data)

    if combined_data:
        combined_prompt = f"""
        Based on analyzing ALL the following data sources together, generate EXACTLY 2 strategic alerts.
        Look for patterns, correlations, and important insights across traffic, citizen reports, news, and upcoming events.
        
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
                    "forecast": len(firebase_data.get("forecast", [])),
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


@app.route("/api/urban-forecast", methods=["POST"])
def urban_forecast():
    """
    API endpoint to generate urban forecasts based on upcoming events in Bengaluru
    """
    try:
        print("🌆 Starting urban forecast process...")

        # Step 1: Fetch forecast data from Firebase
        forecast_data = fetch_forecast_data()

        if not forecast_data:
            return jsonify(
                {
                    "success": False,
                    "message": "No forecast data available from Firebase",
                    "forecasts_generated": 0,
                }
            )

        # Step 2: Generate urban forecasts using Gemini
        forecasts = generate_urban_forecasts(forecast_data)

        if not forecasts:
            return jsonify(
                {
                    "success": False,
                    "message": "Failed to generate urban forecasts",
                    "forecasts_generated": 0,
                }
            )

        # Step 3: Store forecasts to Firebase
        success = store_forecasts_to_firebase(forecasts)

        return jsonify(
            {
                "success": success,
                "message": f"Urban forecast completed successfully. Generated {len(forecasts)} forecasts.",
                "forecasts_generated": len(forecasts),
                "events_analyzed": len(forecast_data),
                "forecasts": forecasts,
            }
        )

    except Exception as e:
        print(f"❌ Error in urban forecast process: {e}")
        return (
            jsonify(
                {
                    "success": False,
                    "message": f"Urban forecast failed: {str(e)}",
                    "forecasts_generated": 0,
                }
            ),
            500,
        )


def fetch_forecast_data():
    """
    Fetch upcoming events data from Firebase forecast collection
    """
    try:
        url = f"{FIREBASE_DATABASE_URL}/forecast.json"
        response = requests.get(url, timeout=10)

        if response.status_code == 200:
            data = response.json()
            if data:
                # Convert Firebase data to list
                events = list(data.values()) if isinstance(data, dict) else data
                print(f"✅ Fetched {len(events)} events from forecast collection")
                return events
            else:
                print("📭 No events found in forecast collection")
                return []
        else:
            print(f"❌ Failed to fetch forecast data: {response.status_code}")
            return []

    except Exception as e:
        print(f"❌ Error fetching forecast data: {e}")
        return []


def generate_urban_forecasts(events_data):
    """
    Generate urban forecasts using Gemini AI based on upcoming events
    """
    try:
        events_json = json.dumps(events_data, indent=2)

        forecast_prompt = f"""
        Given the following list of upcoming events in Bengaluru — each with title, time, and venue — generate urban forecasts and perceptions for the corresponding areas. Consider likely traffic patterns, crowd behavior, weather sensitivity, and civic impact. Identify where congestion, delays, increased activity, or public resource demand may spike.

        Events Data:
        {events_json}

        Structure the response as JSON with the following fields for each forecast:
        - area: Neighborhood or venue region
        - expected_effects: Summary of predicted activity (e.g. "Moderate congestion due to clustered evening events")
        - time_window: Approximate active hours
        - signal_type: One of ["traffic", "crowd", "public_service", "quiet"]
        - confidence: One of ["Low", "Medium", "High"]

        Generate 3-8 forecasts based on the events provided. Focus on areas with multiple events or high-impact venues.

        Return response as valid JSON array with this exact format:
        [
          {{
            "area": "Area/Neighborhood name",
            "expected_effects": "Description of predicted activity and impact",
            "time_window": "Time range (e.g., '6:00 PM - 10:00 PM')",
            "signal_type": "traffic|crowd|public_service|quiet",
            "confidence": "Low|Medium|High"
          }}
        ]

        Make sure the response is valid JSON only, no additional text.
        """

        response = call_gemini(forecast_prompt)

        # Clean and parse the response
        response_cleaned = response.strip()
        if response_cleaned.startswith("```json"):
            response_cleaned = (
                response_cleaned.replace("```json", "").replace("```", "").strip()
            )

        forecasts = json.loads(response_cleaned)

        # Add metadata to each forecast
        for i, forecast in enumerate(forecasts):
            forecast["id"] = (
                f"forecast_{i}_{hashlib.md5(forecast.get('area', '').encode()).hexdigest()[:8]}"
            )
            forecast["created_at"] = datetime.datetime.now().isoformat()
            forecast["source"] = "urban_forecast_ai"

        print(f"✅ Generated {len(forecasts)} urban forecasts")
        return forecasts

    except json.JSONDecodeError as e:
        print(f"❌ Error parsing forecast JSON response: {e}")
        print(f"Raw response: {response}")
        # Return fallback forecast
        return [
            {
                "area": "Central Bengaluru",
                "expected_effects": "General urban activity patterns based on event data analysis",
                "time_window": "Peak hours",
                "signal_type": "traffic",
                "confidence": "Medium",
                "id": "fallback_forecast_1",
                "created_at": datetime.datetime.now().isoformat(),
                "source": "urban_forecast_ai",
            }
        ]
    except Exception as e:
        print(f"❌ Error generating urban forecasts: {e}")
        return []


def store_forecasts_to_firebase(forecasts):
    """
    Store generated urban forecasts to Firebase urban_forecasts collection
    """
    try:
        for forecast in forecasts:
            # Store each forecast individually
            forecast_url = (
                f"{FIREBASE_DATABASE_URL}/urban_forecasts/{forecast['id']}.json"
            )
            response = requests.put(forecast_url, json=forecast, timeout=10)

            if response.status_code == 200:
                print(f"✅ Stored forecast for area: {forecast['area']}")
            else:
                print(
                    f"❌ Failed to store forecast for {forecast['area']}: {response.status_code}"
                )

        print(f"📊 Stored {len(forecasts)} urban forecasts to Firebase")
        return True

    except Exception as e:
        print(f"❌ Error storing forecasts to Firebase: {e}")
        return False


@app.route("/api/forecasts", methods=["GET"])
def get_forecasts():
    """
    API endpoint to fetch urban forecasts from Firebase
    """
    try:
        url = f"{FIREBASE_DATABASE_URL}/urban_forecasts.json"
        response = requests.get(url, timeout=10)

        if response.status_code == 200:
            data = response.json()
            if data:
                # Convert Firebase data to list and sort by creation time
                forecasts = list(data.values())
                forecasts.sort(key=lambda x: x.get("created_at", ""), reverse=True)

                return jsonify(
                    {"success": True, "forecasts": forecasts, "count": len(forecasts)}
                )
            else:
                return jsonify({"success": True, "forecasts": [], "count": 0})
        else:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": f"Failed to fetch forecasts: {response.status_code}",
                        "forecasts": [],
                    }
                ),
                500,
            )

    except Exception as e:
        print(f"❌ Error fetching forecasts: {e}")
        return (
            jsonify(
                {
                    "success": False,
                    "message": f"Failed to fetch forecasts: {str(e)}",
                    "forecasts": [],
                }
            ),
            500,
        )


@app.route("/api/test-forecast", methods=["GET"])
def test_forecast():
    """
    Test endpoint to check forecast data availability
    """
    try:
        forecast_data = fetch_forecast_data()
        return jsonify(
            {
                "success": True,
                "message": "Forecast data test completed",
                "events_found": len(forecast_data),
                "sample_events": forecast_data[:3] if forecast_data else [],
            }
        )
    except Exception as e:
        return (
            jsonify(
                {
                    "success": False,
                    "message": f"Test failed: {str(e)}",
                    "events_found": 0,
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
        port = int(os.environ.get("PORT", 5000))
        app.run(host="0.0.0.0", port=port, debug=False)
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
