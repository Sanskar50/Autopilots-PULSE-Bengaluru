from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import json
import time
import re
import hashlib
import datetime


def generate_unique_id(data_dict):
    """Generate unique ID based on content hash"""
    content_string = json.dumps(data_dict, sort_keys=True)
    unique_hash = hashlib.md5(content_string.encode()).hexdigest()
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"btp_{timestamp}_{unique_hash[:8]}"


# Setup Selenium with headless browser
options = Options()
options.add_argument("--headless")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
driver = webdriver.Chrome(options=options)

# Load the page
driver.get("https://btp.karnataka.gov.in/")
time.sleep(5)  # Let JS render
html = driver.page_source
driver.quit()

soup = BeautifulSoup(html, "html.parser")

# ------------------- Part 1: Scrape Modal Sections -------------------
data = {"events": [], "traffic_alerts": [], "traffic_news": []}

# EVENT_ALERTS block
event_modal = soup.find("div", id="EVENT_ALERTS")
if event_modal:
    body = event_modal.select_one(".modal-body")
    if body:
        text = (
            BeautifulSoup(body.decode_contents(), "html.parser").get_text("\n").strip()
        )
        event_blocks = re.findall(
            r"(Public|Private) Event\s*:.*?(?=(?:Public|Private) Event\s*:|$)",
            text,
            re.DOTALL,
        )

        for block in event_blocks:
            line = block.strip()
            match = re.match(
                r"(Public|Private) Event\s*:\s*(.*?)\s+near\s+(.*?)\s*\|", line
            )
            if match:
                event_type, loc1, loc2 = match.groups()
                location = loc2 if loc2.lower() != "none" else loc1
            else:
                event_type = "Unknown"
                location = "Unknown"

            if location.lower() != "none":
                data["events"].append(
                    {"title": f"{event_type} Event", "location": location.strip()}
                )

# TRAFFIC_ALERTS block
alerts_modal = soup.find("div", id="TRAFFIC_ALERTS")
if alerts_modal:
    body = alerts_modal.select_one(".modal-body")
    if body:
        text = (
            BeautifulSoup(body.decode_contents(), "html.parser").get_text("\n").strip()
        )
        lines = [line.strip() for line in text.split("\n") if line.strip()]

        for line in lines:
            datetime_match = re.search(r"(\d{2}:\d{2}\s*Hrs\s*\d{2}-\d{2}-\d{4})", line)
            datetime_str = datetime_match.group(1) if datetime_match else None
            description = re.sub(
                r"\|\s*\d{2}:\d{2}\s*Hrs\s*\d{2}-\d{2}-\d{4}", "", line
            ).strip()
            description = re.sub(r"\s*\|\s*$", "", description)

            if not datetime_str or not description or len(description.split()) < 3:
                continue

            words = description.split()
            title = " ".join(words[:2]) if len(words) >= 2 else " ".join(words)

            data["traffic_alerts"].append(
                {"title": title, "description": description, "datetime": datetime_str}
            )

# TRAFFIC_NEWS block
news_modal = soup.find("div", id="TRAFFIC_NEWS")
if news_modal:
    body = news_modal.select_one(".modal-body")
    if body:
        items = body.find_all("a")
        for item in items:
            raw_text = item.get_text(strip=True)
            link = item.get("href", "")

            if ":" in raw_text:
                parts = raw_text.split(":", 1)
                title = parts[0].strip()
                description = parts[1].strip()
            else:
                title = raw_text.strip()
                description = ""

            parent_text = item.parent.get_text(" ", strip=True)
            date_match = re.search(r"(\d{2}-\d{2}-\d{4})", parent_text)
            date = date_match.group(1) if date_match else None

            data["traffic_news"].append(
                {
                    "title": title,
                    "description": description,
                    "date": date,
                    "link": link,
                    "type": "traffic",
                }
            )

# ------------------- Part 2: Dedicated Events Card Parsing -------------------

event_data = []
card = soup.find("div", class_="custom-card news-card full-width")
if card:
    modal_body = card.find("div", class_="modal-body news-modal")
    if modal_body:
        content = modal_body.decode_contents().replace("<br>", "\n")
        raw_text = BeautifulSoup(content, "html.parser").get_text()

        pattern = re.compile(
            r"(Public|Private) Event\s*:\s*(.*?)\s+near\s+(.*?)\s*\|\s*Start\s*:\s*(.*?)\s+and\s+End\s*:\s*(\d{2}-\d{2}-\d{4})"
        )
        matches = pattern.finditer(raw_text)

        for match in matches:
            event_type, loc1, loc2, start, end = match.groups()

            if loc1.strip().lower() == "none" and loc2.strip().lower() == "none":
                continue

            location = loc2 if loc2.lower() != "none" else loc1

            event_data.append(
                {
                    "event_type": event_type.strip(),
                    "location": location.strip(),
                    "start_time": start.strip(),
                    "end_time": end.strip(),
                }
            )

# ------------------- Part 3: Merge & Save Unified Output -------------------

merged_events = []

# Combine modal and card events
for e in data["events"]:
    merged_events.append(
        {"event_type": e["title"].split()[0], "location": e["location"]}
    )

merged_events.extend(event_data)

# Add unique IDs to traffic news items
for item in data["traffic_news"]:
    item["unique_id"] = generate_unique_id(item)
    item["scraped_at"] = datetime.datetime.now().isoformat()

combined_data = {
    # "city": "Bangalore",
    # "source": "Bangalore Traffic Police",
    # "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S"),
    # "total_events": len(merged_events),
    # "events": merged_events,
    # "traffic_alerts": data["traffic_alerts"],
    "traffic_news": data["traffic_news"]
}

with open("btp_combined_data.json", "w", encoding="utf-8") as f:
    json.dump(combined_data, f, ensure_ascii=False, indent=2)

print("🧾 All data extracted and saved to 'btp_combined_data.json'")
