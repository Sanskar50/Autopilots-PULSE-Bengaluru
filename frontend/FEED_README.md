# Frontend Live Feed Integration

This README explains the frontend components that display live data from the Firebase Realtime Database populated by the central scraper.

## Components Overview

### 1. FeedCard Component (`/src/components/tabs/FeedCard.tsx`)

The main component that fetches and displays live data from Firebase collections:

**Features:**
- Fetches data from 3 Firebase collections:
  - `btp_traffic_news` - Traffic alerts from Bangalore Traffic Police
  - `reddit_reports` - Traffic, flood, and outage reports from Reddit
  - `citizen_matters_articles` - News articles from Citizen Matters
- Randomizes the order of cards to show mixed content
- Vertical scrolling animation with 3 cards visible at once
- Auto-scrolls every 4 seconds
- Refreshes data every 2 minutes
- Click-to-open external links
- Responsive design with proper sidebar integration

**Data Flow:**
```
Central Scraper → Firebase Realtime DB → Frontend FeedCard → User Interface
```

### 2. FeedTab Component (`/src/components/tabs/FeedTab.tsx`)

Wrapper component that provides the tab interface and integrates FeedCard:

**Features:**
- Clean tab header with live indicator
- Full-height layout integration
- Smooth animations with Framer Motion

### 3. SidePanel Component (`/src/components/SidePanel.tsx`)

Main sidebar that contains the Feed tab along with other tabs:

**Features:**
- Three tabs: Feed, Submit, Agent
- Animated tab transitions
- Responsive design

## Data Structure

Each feed item has the following structure:

```typescript
interface FeedItem {
  unique_id: string;           // Unique identifier
  title?: string;              // Article/report title
  description?: string;        // Content description
  location?: string;           // Location (if available)
  type?: string;              // Type: traffic, flood, outage, etc.
  scraped_at: string;         // Timestamp when scraped
  source_script: string;      // Which scraper collected this
  date?: string;              // Original date (for articles)
  timestamp?: string;         // Reddit timestamp
  article_link?: string;      // External link
  link?: string;              // Alternative link
  author?: string;            // Author name
  post_id?: string;           // Reddit post ID
  source?: string;            // Source type (post/comment)
}
```

## Visual Features

### Card Types & Styling

1. **Traffic News (BTP)**: Red destructive badge with alert icon
2. **Reddit Reports**: 
   - Traffic: Red badge with car icon
   - Flood: Secondary badge with droplets icon  
   - Outage: Outline badge with zap icon
   - General: Message square icon
3. **Citizen Matters**: Default badge with newspaper icon

### Animations

- **Card Entry**: Slide up from bottom with staggered timing
- **Card Exit**: Slide up and fade out
- **Auto-scroll**: Smooth vertical transitions
- **Hover Effects**: Subtle scale and shadow changes
- **Loading States**: Skeleton loaders with pulse animation

### Layout

- **Sidebar Integration**: Fixed width panel on right side
- **Responsive**: Adapts to different screen sizes
- **Vertical Feed**: Shows 3 cards at once with smooth scrolling
- **Progress Indicators**: Dots showing current position in feed

## Configuration

### Firebase Configuration

Update the Firebase URL in `FeedCard.tsx`:

```typescript
const FIREBASE_CONFIG = {
  databaseURL: 'https://pulse-bengaluru-2933b-default-rtdb.firebaseio.com/'
};
```

### Timing Configuration

```typescript
const ITEMS_TO_SHOW = 3;              // Cards visible at once
const AUTO_SCROLL_INTERVAL = 4000;    // 4 seconds between scrolls
const DATA_REFRESH_INTERVAL = 120000; // 2 minutes data refresh
```

## Running the Frontend

1. **Install Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```

3. **Build for Production:**
   ```bash
   npm run build
   ```

## Integration with Central Scraper

The frontend automatically connects to Firebase and displays data as soon as the central scraper populates the database. No additional configuration is needed beyond ensuring:

1. Firebase Realtime Database is accessible
2. The database URL matches in both scraper and frontend
3. The scraper is running and populating data

## Troubleshooting

### Common Issues

1. **No Data Showing:**
   - Check if central scraper is running
   - Verify Firebase database URL
   - Check browser console for network errors

2. **Cards Not Animating:**
   - Ensure framer-motion is installed
   - Check for CSS conflicts
   - Verify component structure

3. **External Links Not Working:**
   - Check if `article_link` or `link` fields exist in data
   - Verify URLs are properly formatted

### Debug Mode

Add console logging to track data flow:

```typescript
console.log('Fetched data:', allData);
console.log('Visible items:', visibleItems);
```

## Customization

### Adding New Card Types

1. Update the `getCardIcon()` function for new icons
2. Add new badge variants in `getBadgeVariant()`
3. Update `getBadgeText()` for display names

### Modifying Animation Timing

Update the motion properties in the component:

```typescript
initial={{ opacity: 0, y: 60, scale: 0.9 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
transition={{ delay: index * 0.1, duration: 0.6 }}
```

### Changing Layout

Modify the `ITEMS_TO_SHOW` constant and CSS classes to show more/fewer cards or change the layout orientation.

## Dependencies

- React 18+
- Framer Motion 12+
- Tailwind CSS
- Radix UI components
- Lucide React icons

The feed component is fully integrated with the existing design system and theme toggle functionality.
