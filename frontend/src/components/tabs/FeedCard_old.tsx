import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, AlertTriangle, MessageSquare, Newspaper, ExternalLink, Car, Droplets, Zap, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Firebase configuration
const FIREBASE_CONFIG = {
  databaseURL: 'https://pulse-bengaluru-2933b-default-rtdb.firebaseio.com/'
};

interface FeedItem {
  unique_id: string;
  title?: string;
  description?: string;
  location?: string;
  type?: string;
  scraped_at: string;
  source_script: string;
  date?: string;
  timestamp?: string;
  article_link?: string;
  link?: string;
  author?: string;
  post_id?: string;
  source?: string;
  post_url?: string;
  comment_url?: string;
}

const FeedCard = () => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const AUTO_SCROLL_INTERVAL = 6000; // 6 seconds

  // Shuffle array function
  const shuffleArray = (array: FeedItem[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Fetch data from Firebase collections
  const fetchFeedData = async () => {
    try {
      const collections = [
        'btp_traffic_news',
        'reddit_reports', 
        'citizen_matters_articles'
      ];

      const allData: FeedItem[] = [];

      for (const collection of collections) {
        try {
          const response = await fetch(`${FIREBASE_CONFIG.databaseURL}/${collection}.json`);
          if (response.ok) {
            const data = await response.json();
            if (data) {
              const items = Object.values(data) as FeedItem[];
              allData.push(...items);
            }
          }
        } catch (error) {
          console.error(`Error fetching ${collection}:`, error);
        }
      }

      // Randomize the order of items instead of sorting by time
      const shuffledData = shuffleArray(allData);
      setFeedItems(shuffledData);
      
      // Set initial visible items
      setVisibleItems(shuffledData.slice(0, ITEMS_TO_SHOW));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching feed data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedData();
    // Refresh data every 2 minutes and reshuffle
    const interval = setInterval(() => {
      fetchFeedData();
    }, 120000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll through items
  useEffect(() => {
    if (feedItems.length > ITEMS_TO_SHOW) {
      const interval = setInterval(() => {
        setCurrentStartIndex(prev => {
          const nextIndex = (prev + 1) % (feedItems.length - ITEMS_TO_SHOW + 1);
          const nextItems = feedItems.slice(nextIndex, nextIndex + ITEMS_TO_SHOW);
          setVisibleItems(nextItems);
          return nextIndex;
        });
      }, AUTO_SCROLL_INTERVAL);
      
      return () => clearInterval(interval);
    }
  }, [feedItems.length]);

  const getCardIcon = (item: FeedItem) => {
    if (item.source_script === 'reddit_reports') {
      switch (item.type) {
        case 'traffic': return <Car className="h-4 w-4" />;
        case 'flood': return <Droplets className="h-4 w-4" />;
        case 'outage': return <Zap className="h-4 w-4" />;
        default: return <MessageSquare className="h-4 w-4" />;
      }
    } else if (item.source_script === 'citizen_matters_articles') {
      return <Newspaper className="h-4 w-4" />;
    } else {
      return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getBadgeVariant = (item: FeedItem) => {
    if (item.type === 'traffic' || item.source_script === 'btp_traffic_news') {
      return 'destructive';
    } else if (item.type === 'flood') {
      return 'secondary';
    } else if (item.type === 'outage') {
      return 'outline';
    } else {
      return 'default';
    }
  };

  const getBadgeText = (item: FeedItem) => {
    if (item.source_script === 'btp_traffic_news') {
      return 'Traffic Alert';
    } else if (item.source_script === 'reddit_reports') {
      return  'Reddit';
    } else if (item.source_script === 'citizen_matters_articles') {
      return 'News';
    }
    return 'Update';
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleCardClick = (item: FeedItem) => {
    const link = item.article_link || item.link || item.post_url || item.comment_url;
    if (link) {
      window.open(link, '_blank');
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-full flex flex-col gap-3 p-2"
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gradient-to-br from-background to-muted/20 rounded-lg border border-border/30 p-4 shadow-sm animate-pulse"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="h-5 bg-muted rounded w-20"></div>
              <div className="h-4 bg-muted rounded w-16"></div>
            </div>
            <div className="h-4 bg-muted rounded w-full mb-2"></div>
            <div className="h-3 bg-muted rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  if (feedItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-full flex items-center justify-center p-4"
      >
        <div className="text-center space-y-2">
          <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">No updates available</p>
          <p className="text-xs text-muted-foreground">Check back later for the latest news</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Feed Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-3 border-b border-border/20"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Live Feed</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {feedItems.length} updates
        </div>
      </motion.div>

      {/* Scrolling Feed Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden p-2 space-y-3"
      >
        <AnimatePresence mode="sync">
          {visibleItems.map((item, index) => (
            <motion.div
              key={`${item.unique_id}-${currentStartIndex}`}
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                transition: {
                  delay: index * 0.1,
                  duration: 0.6,
                  ease: "easeOut"
                }
              }}
              exit={{ 
                opacity: 0, 
                y: -60, 
                scale: 0.9,
                transition: {
                  duration: 0.4,
                  ease: "easeIn"
                }
              }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              className={`
                bg-gradient-to-br from-background to-muted/10 
                rounded-lg border border-border/30 p-4 shadow-sm
                cursor-pointer hover:shadow-md hover:border-border/50
                transition-all duration-200
                ${(item.article_link || item.link) ? 'hover:bg-accent/5' : ''}
              `}
              onClick={() => handleCardClick(item)}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <Badge 
                  variant={getBadgeVariant(item)} 
                  className="text-xs flex items-center gap-1.5 px-2 py-1"
                >
                  {getCardIcon(item)}
                  {getBadgeText(item)}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {getTimeAgo(item.scraped_at || item.timestamp || '')}
                </div>
              </div>
              
              {/* Card Content */}
              <h3 className="text-sm font-medium text-foreground mb-2 leading-relaxed line-clamp-2">
                {item.title || 'Latest Update'}
              </h3>
              
              {item.description && (
                <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                  {item.description}
                </p>
              )}
              
              {/* Card Footer */}
              <div className="flex items-center justify-between">
                {item.location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate max-w-[120px]">{item.location}</span>
                  </div>
                )}
                
                {(item.article_link || item.link || item.post_url || item.comment_url) && (
                  <motion.div 
                    whileHover={{ x: 2 }}
                    className="flex items-center gap-1 text-xs text-accent hover:text-accent-foreground"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Read more</span>
                  </motion.div>
                )}
              </div>

              {/* Author Info */}
              {item.author && (
                <div className="mt-2 pt-2 border-t border-border/20">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span>By</span>
                    <span className="font-medium">{item.author}</span>
                  </p>
                </div>
              )}

              {/* Source Info */}
              {item.source && (
                <div className="mt-1">
                  <p className="text-xs text-muted-foreground">
                    Source: {item.source}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Feed Progress Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-3 border-t border-border/20"
      >
        <div className="flex justify-center items-center gap-2">
          <div className="flex gap-1">
            {feedItems.length > ITEMS_TO_SHOW && [...Array(Math.min(5, Math.ceil(feedItems.length / ITEMS_TO_SHOW)))].map((_, index) => {
              const isActive = Math.floor(currentStartIndex / ITEMS_TO_SHOW) === index;
              return (
                <motion.div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    isActive ? 'bg-accent' : 'bg-muted-foreground/30'
                  }`}
                  animate={{ scale: isActive ? 1.2 : 1 }}
                />
              );
            })}
          </div>
          <span className="text-xs text-muted-foreground ml-2">
            Auto-updating
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default FeedCard;