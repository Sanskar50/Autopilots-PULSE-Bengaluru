import json
import datetime
import os
import hashlib


class JSONLogger:
    def __init__(self, filename="reddit_reports.json"):
        self.filename = filename
        self.reports = []

    def generate_unique_id(self, data_dict):
        """Generate unique ID based on content hash"""
        content_string = json.dumps(data_dict, sort_keys=True)
        unique_hash = hashlib.md5(content_string.encode()).hexdigest()
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        return f"{timestamp}_{unique_hash[:8]}"

    def log_report(self, report):
        # Add unique ID and timestamp when logged
        unique_id = self.generate_unique_id(report)
        report_with_log_time = {
            "unique_id": unique_id,
            **report,
            "logged_at": datetime.datetime.now().isoformat(),
        }
        self.reports.append(report_with_log_time)

        # Write to file
        with open(self.filename, "w", encoding="utf-8") as f:
            json.dump(self.reports, f, indent=2, ensure_ascii=False)

        print(json.dumps(report_with_log_time, indent=2, ensure_ascii=False))
        print("-" * 50)

    def get_all_reports(self):
        return self.reports

    def get_reports_by_type(self, report_type):
        return [r for r in self.reports if r["type"] == report_type]

    def get_reports_by_location(self, location):
        return [r for r in self.reports if r["location"].lower() == location.lower()]


# Global logger instance
logger = JSONLogger()
