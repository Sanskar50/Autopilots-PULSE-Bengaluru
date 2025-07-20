import json
import datetime
import os

class JSONLogger:
    def __init__(self, filename="reddit_reports.json"):
        self.filename = filename
        self.reports = []
        
    def log_report(self, report):
        # Add timestamp when logged
        report_with_log_time = {
            **report,
            "logged_at": datetime.datetime.now().isoformat()
        }
        self.reports.append(report_with_log_time)
        
        # Write to file
        with open(self.filename, 'w', encoding='utf-8') as f:
            json.dump(self.reports, f, indent=2, ensure_ascii=False)
        
        # Also print formatted JSON
        print("📄 Report Logged:")
        print(json.dumps(report_with_log_time, indent=2, ensure_ascii=False))
        print("-" * 50)
    
    def get_all_reports(self):
        return self.reports
    
    def get_reports_by_type(self, report_type):
        return [r for r in self.reports if r['type'] == report_type]
    
    def get_reports_by_location(self, location):
        return [r for r in self.reports if r['location'].lower() == location.lower()]

# Global logger instance
logger = JSONLogger() 