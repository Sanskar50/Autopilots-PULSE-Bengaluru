# Central Scraper Orchestrator

This project contains a central orchestrator that runs three different scrapers sequentially and stores their data in Firebase Realtime Database with unique IDs to prevent duplication.

## Scrapers Included

1. **BTP Traffic Scraper** (`btp_scraped_all3.py`) - Scrapes traffic news from Bangalore Traffic Police website
2. **Reddit Scraper** (`reddit_scraper_enhanced.py`) - Scrapes traffic, flood, and outage reports from Bangalore-related subreddits  
3. **Citizen Matters Scraper** (`CitizenMatters.py`) - Scrapes news articles from Citizen Matters Bengaluru

## Features

- ⏱️ **Timeout Management**: Each scraper runs for a maximum of 3 minutes
- 🔄 **Sequential Execution**: Scrapers run one after another with 10-second intervals
- 🔥 **Firebase Integration**: All data is stored in Firebase Realtime Database
- 🆔 **Unique IDs**: Each data item gets a unique ID to prevent duplicates
- 📊 **Duplicate Detection**: Existing data is not re-inserted
- 🔧 **Error Handling**: Robust error handling for network issues and timeouts

## Setup Instructions

### 1. Prerequisites

- Python 3.7+
- Google Chrome browser (for Selenium)
- Firebase project with Realtime Database enabled

### 2. Quick Setup

Run the setup script to install all dependencies:

```bash
chmod +x setup.sh
./setup.sh
```

### 3. Manual Setup (Alternative)

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install Chrome and ChromeDriver (Ubuntu/Debian)
sudo apt-get install google-chrome-stable
# Download ChromeDriver from https://chromedriver.chromium.org/
```

### 4. Configure Environment Variables

Create a `.env` file with your credentials:

```env
# Firebase Configuration
FIREBASE_URL=https://your-project-default-rtdb.firebaseio.com/
FIREBASE_CREDENTIALS_PATH=/path/to/your/firebase-service-account-key.json

# Reddit API (for reddit_scraper_enhanced.py)
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=agentic-ai-scraper-v2
```

### 5. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Realtime Database
4. Generate a service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save the JSON file and update `FIREBASE_CREDENTIALS_PATH` in `.env`

### 6. Reddit API Setup (Optional)

If you want to use the Reddit scraper:

1. Go to [Reddit Apps](https://www.reddit.com/prefs/apps)
2. Create a new application
3. Note down the client ID and secret
4. Update the Reddit credentials in `.env`

## Usage

### Run All Scrapers

```bash
python central_scraper.py
```

### Run Individual Scrapers

```bash
# BTP Traffic Scraper
python btp_scraped_all3.py

# Reddit Scraper  
python reddit_scraper_enhanced.py

# Citizen Matters Scraper
python CitizenMatters.py
```

## Firebase Data Structure

The data is stored in Firebase Realtime Database with the following collections:

### `btp_traffic_news/`
```json
{
  "unique_id": {
    "title": "Traffic News Title",
    "description": "Description",
    "date": "25-07-2024",
    "link": "https://...",
    "type": "traffic",
    "unique_id": "btp_20240725_123456_abc12345",
    "scraped_at": "2024-07-25T12:34:56.789Z",
    "source_script": "btp_traffic_news"
  }
}
```

### `reddit_reports/`
```json
{
  "unique_id": {
    "type": "traffic|flood|outage",
    "location": "Koramangala",
    "description": "Report description",
    "timestamp": "2024-07-25T12:34:56Z",
    "source": "post|comment",
    "post_id": "reddit_post_id",
    "unique_id": "20240725_123456_def67890",
    "logged_at": "2024-07-25T12:34:56.789",
    "scraped_at": "2024-07-25T12:34:56.789Z",
    "source_script": "reddit_reports"
  }
}
```

### `citizen_matters_articles/`
```json
{
  "unique_id": {
    "title": "Article Title",
    "article_link": "https://...",
    "author": "Author Name", 
    "date": "July 25, 2024",
    "type": "General News",
    "unique_id": "cm_20240725_123456_ghi78901",
    "scraped_at": "2024-07-25T12:34:56.789Z",
    "source_script": "citizen_matters_articles"
  }
}
```

## Configuration

### Timeout Settings

- Each scraper runs for a maximum of 3 minutes (180 seconds)
- 10-second wait between scrapers
- 5-second timeout for process termination

### Duplicate Prevention

- Unique IDs are generated using MD5 hash of content + timestamp
- Firebase checks for existing data before insertion
- Duplicates are logged but not stored

## Troubleshooting

### Common Issues

1. **ChromeDriver not found**
   ```bash
   # Install ChromeDriver manually
   sudo apt-get install chromium-chromedriver
   ```

2. **Firebase permission errors**
   - Check service account key path
   - Verify Firebase project permissions
   - Ensure Realtime Database is enabled

3. **Reddit API errors**
   - Verify Reddit credentials in `.env`
   - Check Reddit API rate limits

4. **Network timeouts**
   - Check internet connection
   - Verify target websites are accessible

### Logs

The central scraper provides detailed logging:
- ✅ Success indicators
- ❌ Error messages  
- 📊 Data statistics
- ⏰ Timeout notifications

## File Structure

```
Scrapers/
├── central_scraper.py          # Main orchestrator
├── btp_scraped_all3.py        # BTP traffic scraper
├── reddit_scraper_enhanced.py  # Reddit scraper
├── CitizenMatters.py          # Citizen Matters scraper
├── json_logger.py             # JSON logging utility
├── requirements.txt           # Python dependencies
├── setup.sh                   # Setup script
├── .env                       # Environment variables
└── README.md                  # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational and research purposes. Please respect the terms of service of the websites being scraped.
