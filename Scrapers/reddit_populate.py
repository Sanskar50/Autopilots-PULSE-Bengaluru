import subprocess
import time
import json
import hashlib
import datetime
import os
import signal
import requests
from concurrent.futures import ThreadPoolExecutor, TimeoutError
import firebase_admin
from firebase_admin import credentials, db
from dotenv import load_dotenv

load_dotenv()

print(f"FIREBASE_DATABASE_URL: {os.getenv('FIREBASE_DATABASE_URL')}")
print(f"FIREBASE_PROJECT_ID: {os.getenv('FIREBASE_PROJECT_ID')}")
# Also check other relevant ones
print(f"REDDIT_CLIENT_ID: {os.getenv('REDDIT_CLIENT_ID')}")
print(f"REDDIT_CLIENT_SECRET: {os.getenv('REDDIT_CLIENT_SECRET')}")


class CentralScraper:
    def __init__(self):
        self.firebase_database_url = os.getenv("FIREBASE_DATABASE_URL")
        self.firebase_project_id = os.getenv("FIREBASE_PROJECT_ID")
        self.initialize_firebase()

    def initialize_firebase(self):
        try:
            # Fall back to REST API if no service account key
            print("🔧 No service account key found, using Firebase REST API")
            self.use_rest_api = True

        except Exception as e:
            print(f"❌ Firebase initialization error: {e}")
            print("🔧 Falling back to REST API")
            self.use_rest_api = True

    def generate_unique_id(self, data_dict):
        """Generate unique ID based on content hash"""
        # Create a consistent string representation for hashing
        content_string = json.dumps(data_dict, sort_keys=True)
        unique_hash = hashlib.md5(content_string.encode()).hexdigest()
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        return f"{timestamp}_{unique_hash[:8]}"

    def check_duplicate(self, collection_name, unique_id):
        """Check if data already exists in Firebase"""
        if hasattr(self, "use_rest_api") and self.use_rest_api:
            return self.check_duplicate_rest(collection_name, unique_id)

        try:
            ref = db.reference(f"{collection_name}/{unique_id}")
            existing_data = ref.get()
            return existing_data is not None
        except Exception as e:
            print(f"❌ Error checking duplicate: {e}")
            return False

    def store_to_firebase(self, collection_name, data_list):
        """Store data to Firebase Realtime Database with unique IDs"""
        if hasattr(self, "use_rest_api") and self.use_rest_api:
            return self.store_to_firebase_rest(collection_name, data_list)

        if not data_list:
            print(f"📭 No data to store for {collection_name}")
            return

        stored_count = 0
        duplicate_count = 0

        try:
            ref = db.reference(collection_name)

            for item in data_list:
                # Add metadata
                item["scraped_at"] = datetime.datetime.now().isoformat()
                item["source_script"] = collection_name

                # Generate unique ID
                unique_id = self.generate_unique_id(item)
                item["unique_id"] = unique_id

                # Check for duplicates
                if not self.check_duplicate(collection_name, unique_id):
                    ref.child(unique_id).set(item)
                    stored_count += 1
                    print(
                        f"✅ Stored {collection_name}: {item.get('title', item.get('type', 'Unknown'))[:50]}..."
                    )
                else:
                    duplicate_count += 1
                    print(f"⏭️  Skipped duplicate in {collection_name}")

        except Exception as e:
            print(f"❌ Error storing to Firebase: {e}")

        print(
            f"📊 {collection_name}: {stored_count} stored, {duplicate_count} duplicates skipped"
        )

    def check_duplicate_rest(self, collection_name, unique_id):
        """Check if data already exists using REST API"""
        try:
            import requests

            url = f"{self.firebase_database_url}/{collection_name}/{unique_id}.json"
            response = requests.get(url)
            return response.status_code == 200 and response.json() is not None
        except Exception as e:
            print(f"❌ Error checking duplicate via REST: {e}")
            return False

    def store_to_firebase_rest(self, collection_name, data_list):
        """Store data to Firebase using REST API"""
        if not data_list:
            print(f"📭 No data to store for {collection_name}")
            return

        stored_count = 0
        duplicate_count = 0

        try:

            for item in data_list:
                # Add metadata
                item["scraped_at"] = datetime.datetime.now().isoformat()
                item["source_script"] = collection_name

                # Generate unique ID
                unique_id = self.generate_unique_id(item)
                item["unique_id"] = unique_id

                # Check for duplicates
                if not self.check_duplicate_rest(collection_name, unique_id):
                    url = f"{self.firebase_database_url}/{collection_name}/{unique_id}.json"
                    response = requests.put(url, json=item, timeout=10)

                    if response.status_code == 200:
                        stored_count += 1
                        print(
                            f"✅ Stored {collection_name}: {item.get('title', item.get('type', 'Unknown'))[:50]}..."
                        )
                    else:
                        print(f"❌ Failed to store item: {response.status_code}")
                else:
                    duplicate_count += 1
                    print(f"⏭️  Skipped duplicate in {collection_name}")

        except Exception as e:
            print(f"❌ Error storing to Firebase via REST: {e}")

        print(
            f"📊 {collection_name}: {stored_count} stored, {duplicate_count} duplicates skipped"
        )

    def run_script_with_timeout(self, script_name, timeout_seconds=180, args=None):
        """Run a script with timeout (3 minutes)"""
        if args is None:
            args = []

        print(f"🚀 Starting {script_name} (timeout: {timeout_seconds}s)")
        start_time = time.time()

        try:
            # Start the process
            command = ["python", script_name] + args
            process = subprocess.Popen(
                command,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd="/home/needl/Downloads/Autopilots/Scrapers",
            )

            # Wait for completion or timeout
            try:
                stdout, stderr = process.communicate(timeout=timeout_seconds)
                elapsed = time.time() - start_time

                if process.returncode == 0:
                    print(f"✅ {script_name} completed successfully in {elapsed:.1f}s")
                    return True, stdout, stderr
                else:
                    print(
                        f"❌ {script_name} failed with return code {process.returncode}"
                    )
                    print(f"stderr: {stderr}")
                    return False, stdout, stderr

            except subprocess.TimeoutExpired:
                print(
                    f"⏰ {script_name} timed out after {timeout_seconds}s, terminating..."
                )
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
                return False, "", "Script timed out"

        except Exception as e:
            print(f"❌ Error running {script_name}: {e}")
            return False, "", str(e)

    def load_json_data(self, filename):
        """Load data from JSON file"""
        filepath = f"/home/needl/Downloads/Autopilots/Scrapers/{filename}"
        try:
            if os.path.exists(filepath):
                with open(filepath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                print(f"📄 Loaded data from {filename}")
                return data
            else:
                print(f"❌ File not found: {filename}")
                return None
        except Exception as e:
            print(f"❌ Error loading {filename}: {e}")
            return None

    def process_btp_data(self):
        """Process BTP scraper data"""
        data = self.load_json_data("btp_combined_data.json")
        if data and "traffic_news" in data:
            self.store_to_firebase("btp_traffic_news", data["traffic_news"])

    def process_reddit_data(self):
        """Process Reddit scraper data"""
        data = self.load_json_data("reddit_reports.json")
        if data and isinstance(data, list):
            self.store_to_firebase("reddit_reports", data)

    def process_citizen_matters_data(self):
        """Process Citizen Matters data"""
        data = self.load_json_data("citizen_matters_data.json")
        if data and isinstance(data, list):
            self.store_to_firebase("citizen_matters_articles", data)

    def run_all_scrapers(self):
        """Run all scrapers sequentially with timeouts"""
        print("🎯 Starting Central Scraper Orchestrator")
        print("=" * 60)

        # Script configurations: (script_name, timeout_seconds, processor_function, args)
        scrapers = [
            ("btp_scraped_all3.py", 180, self.process_btp_data, []),
            # (
            #     "reddit_scraper_enhanced.py",
            #     300,
            #     self.process_reddit_data,
            #     [],
            # ),
            # ("CitizenMatters.py", 180, self.process_citizen_matters_data, []),
        ]

        for script_name, timeout, processor, args in scrapers:
            # print(f"\n🔄 Running {script_name}...")
            # success, stdout, stderr = self.run_script_with_timeout(
            #     script_name, timeout, args
            # )

            success = True
            if success:
                # Process the data after script completion
                try:
                    print(f"🔄 Processing data from {script_name}...")
                    processor()
                except Exception as e:
                    print(f"❌ Error processing data from {script_name}: {e}")
            else:
                print(f"⚠️  {script_name} did not complete successfully")
                if stderr:
                    print(
                        f"Error details: {stderr[:500]}..."
                    )  # Show first 500 chars of error

            print(f"⏱️  Waiting 10 seconds before next scraper...")
            time.sleep(10)

        print("\n🎉 All scrapers completed!")
        print("=" * 60)


if __name__ == "__main__":
    print("🎯 Central Scraper Orchestrator")
    print("🔧 Checking environment configuration...")

    # Check if required environment variables are set
    required_vars = [
        "FIREBASE_DATABASE_URL",
        "FIREBASE_PROJECT_ID",
        "REDDIT_CLIENT_ID",
        "REDDIT_CLIENT_SECRET",
    ]
    missing_vars = [var for var in required_vars if not os.getenv(var)]

    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("Please check your .env file")
        exit(1)

    print("✅ Environment configuration looks good!")
    scraper = CentralScraper()
    scraper.run_all_scrapers()
