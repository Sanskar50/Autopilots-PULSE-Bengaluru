import praw
import datetime
import re
import os
import time
from dotenv import load_dotenv
from json_logger import logger

load_dotenv()
# --- CONFIGURATION ---
REDDIT_CLIENT_ID = os.getenv('REDDIT_CLIENT_ID')
REDDIT_CLIENT_SECRET = os.getenv('REDDIT_CLIENT_SECRET')
REDDIT_USER_AGENT = os.getenv('REDDIT_USER_AGENT', 'agentic-ai-scraper-v2')

# More relevant subreddits for traffic, weather, and outages
SUBREDDITS = [
    'bangalore', 'bengaluru', 'bangalorehelp', 'karnataka',
    'india', 'IndiaSpeaks', 'IndiaNews', 'indiaweather',
    'IndiaUrbanPlanning', 'UrbanIndia',
    'Bengaluru', 'bengaluru_speaks',
    'BangaloreTransit',
    'Whitefield', 'Koramangala', 'Indiranagar',
    'Marathahalli', 'MGroad', 'HSRLayout', 'JPNagar'
]

KEYWORDS = {
    'traffic': ['traffic jam', 'traffic', 'jam', 'congestion', 'accident', 'roadblock'],
    'flood': ['flood', 'waterlogging', 'rain', 'inundated', 'downpour'],
    'outage': ['power cut', 'outage', 'blackout', 'electricity', 'no power']
}

LOCATION_REGEX = r'(koramangala|whitefield|indiranagar|mg road|marathahalli|hebbal|btm|jayanagar|malleshwaram|outer ring road|bellandur|banashankari|basavanagudi|rajajinagar|yelahanka|hosur road|electronic city|bengaluru|bangalore|shantinagar)'
MAX_AGE_HOURS = 48
COMMENT_REVISIT_INTERVAL = 300  # Revisit posts every 5 minutes for new comments

# Track processed posts and their last comment count
processed_posts = {}  # {post_id: last_comment_count}

now = time.time()

def extract_type_and_location(text):
    t = text.lower()
    for rep_type, kws in KEYWORDS.items():
        if any(kw in t for kw in kws):
            match = re.search(LOCATION_REGEX, t)
            if match:
                return rep_type, match.group(0).title()
    return None, None

def reddit_post_to_report(title, body, created_utc):
    report_type, location = extract_type_and_location(title + ' ' + body)
    if not report_type: return None
    description = (title + '. ' + body).strip()
    if len(description) < 30: return None
    timestamp = datetime.datetime.utcfromtimestamp(created_utc).isoformat() + 'Z'
    return {'type': report_type, 'location': location, 'description': description, 'timestamp': timestamp}

def process_comments(submission, is_new_post=False):
    """Process comments and return new comment count"""
    try:
        # Load all comments
        submission.comments.replace_more(limit=0)
        current_comments = submission.comments.list()
        current_comment_count = len(current_comments)
        
        # Get previous comment count
        post_id = submission.id
        previous_comment_count = processed_posts.get(post_id, 0)
        
        if is_new_post:
            # For new posts, process all comments
            comments_to_process = current_comments
            print(f"🆕 New post: {submission.title[:50]}... ({current_comment_count} comments)")
        else:
            # For revisits, only process new comments
            if current_comment_count > previous_comment_count:
                comments_to_process = current_comments[previous_comment_count:]
                print(f"🔄 Revisiting post: {submission.title[:50]}... (+{len(comments_to_process)} new comments)")
            else:
                comments_to_process = []
                print(f"⏭️  No new comments for: {submission.title[:50]}...")
        
        # Process comments
        for comment in comments_to_process:
            r = reddit_post_to_report(submission.title, comment.body, comment.created_utc)
            if r:
                r['source'] = 'comment'
                r['post_id'] = post_id
                log_report(r)
        
        # Update comment count
        processed_posts[post_id] = current_comment_count
        return current_comment_count
        
    except Exception as e:
        print(f"❌ Error processing comments: {e}")
        return 0

def handle_submission(submission):
    age_hours = (now - submission.created_utc) / 3600
    if age_hours > MAX_AGE_HOURS: 
        return
    
    post_id = submission.id
    
    # Check if this is a new post or revisit
    is_new_post = post_id not in processed_posts
    
    if is_new_post:
        # Process the main post content
        r = reddit_post_to_report(submission.title, submission.selftext, submission.created_utc)
        if r:
            r['source'] = 'post'
            r['post_id'] = post_id
            log_report(r)
            print(f"📝 Processed post: {submission.title[:50]}...")
    
    # Process comments (new or existing)
    process_comments(submission, is_new_post)

def revisit_posts_for_new_comments():
    """Revisit posts to check for new comments"""
    print(f"🔄 Revisiting {len(processed_posts)} posts for new comments...")
    
    for post_id in list(processed_posts.keys()):
        try:
            # Get the submission object
            submission = reddit.submission(id=post_id)
            
            # Check if post still exists and is within age limit
            age_hours = (now - submission.created_utc) / 3600
            if age_hours > MAX_AGE_HOURS:
                # Remove old posts from tracking
                del processed_posts[post_id]
                continue
            
            # Process new comments
            process_comments(submission, is_new_post=False)
            
        except Exception as e:
            print(f"❌ Error revisiting post {post_id}: {e}")
            # Remove problematic posts from tracking
            if post_id in processed_posts:
                del processed_posts[post_id]

def log_report(report):
    """Log report to JSON file"""
    logger.log_report(report)

if __name__ == '__main__':
    print("🚀 Starting Enhanced Reddit Scraper (Data Collection Only)...")
    print(f"📁 Reports will be saved to: {logger.filename}")
    print(f"🔄 Will revisit posts every {COMMENT_REVISIT_INTERVAL} seconds for new comments")
    print("📊 No backend posting - data collection only")
    print("-" * 50)
    
    reddit = praw.Reddit(client_id=REDDIT_CLIENT_ID,
                         client_secret=REDDIT_CLIENT_SECRET,
                         user_agent=REDDIT_USER_AGENT)
    
    # Combine subreddits into a search-stream channel
    subs = '+'.join(SUBREDDITS)
    stream = reddit.subreddit(subs).stream.submissions(pause_after=0)
    
    last_revisit_time = time.time()
    
    for submission in stream:
        if submission is None:
            # Check if it's time to revisit posts for new comments
            current_time = time.time()
            if current_time - last_revisit_time >= COMMENT_REVISIT_INTERVAL:
                revisit_posts_for_new_comments()
                last_revisit_time = current_time
            
            time.sleep(5)
            continue
        
        handle_submission(submission) 