import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { MapPin, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SubmitForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: '',
    lat: '',
    lng: '',
    city: 'Detecting...',
    area: 'Detecting...'
  });
  const [media, setMedia] = useState<File | null>(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude.toFixed(6);
          const lng = pos.coords.longitude.toFixed(6);

          try {
            const res = await fetch(
              `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=5e15b819dfff4647aa6f190121491fc1`
            );
            const data = await res.json();
            const props = data.features?.[0]?.properties || {};
            const city = props.city || 'Unknown';
            const area =
              props.suburb ||
              props.district ||
              props.state ||
              props.formatted ||
              'Unknown';

            setFormData((prev) => ({
              ...prev,
              lat,
              lng,
              city,
              area,
              location: `${city}, ${area}`
            }));
          } catch {
            setFormData((prev) => ({
              ...prev,
              lat,
              lng,
              city: 'Unknown',
              area: 'Unknown'
            }));
          }
        },
        () => {
          setFormData((prev) => ({
            ...prev,
            lat: 'Unavailable',
            lng: 'Unavailable',
            city: 'Unavailable',
            area: 'Unavailable'
          }));
        }
      );
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!media) {
      toast({ title: 'Image Required', description: 'Please upload a photo.' });
      return;
    }

    const payload = new FormData();
    payload.append('media', media);
    payload.append('title', formData.title);
    payload.append('description', formData.description);
    payload.append('location', formData.location);
    payload.append('type', formData.type);
    payload.append('city', formData.city);
    payload.append('area', formData.area);
    payload.append('lat', formData.lat);
    payload.append('lng', formData.lng);


    await fetch('http://localhost:9000/submit', {
      method: 'POST',
      body: payload
    });

    toast({
      title: 'Report Submitted',
      description: `Your update from ${formData.city}, ${formData.area} has been saved.`
    });

    setMedia(null);
    setFormData({
      title: '',
      description: '',
      location: '',
      type: '',
      lat: '',
      lng: '',
      city: 'Detecting...',
      area: 'Detecting...'
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="h-full flex flex-col"
    >
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-border/30 scrollbar-track-transparent">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="media" className="text-xs font-medium">Upload Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setMedia(e.target.files?.[0] || null)}
              className="bg-background/50 border-border/30 text-sm h-8"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-medium">Title</Label>
            <Input
              id="title"
              placeholder="Brief description"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="bg-background/50 border-border/30 text-sm h-8"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-medium">Description</Label>
            <Textarea
              id="description"
              placeholder="Detailed description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="bg-background/50 border-border/30 text-sm min-h-[60px] resize-none"
              required
            />
          </div>

          <div className="space-y-1 text-xs text-muted-foreground p-2 rounded-md bg-secondary/30 border border-border/20">
            <div><strong>📍 Detected:</strong> {formData.city}, {formData.area}</div>
            <div><strong>📌 Coords:</strong> {formData.lat}, {formData.lng}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-xs font-medium">Manual Location</Label>
            <div className="relative">
              <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                id="location"
                placeholder="You can override auto-detected location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="bg-background/50 border-border/30 text-sm h-8 pl-7"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Type</Label>
            <Select onValueChange={(value) => handleInputChange('type', value)} required>
              <SelectTrigger className="bg-background/50 border-border/30 text-sm h-8">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flood">🌊 Flood</SelectItem>
                <SelectItem value="traffic">🚦 Traffic</SelectItem>
                <SelectItem value="general">📰 General News</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
      </div>
      
      {/* Fixed submit button */}
      <div className="mt-4 pt-3 border-t border-border/20 flex-shrink-0">
        <Button
          onClick={handleSubmit}
          size="sm"
          className="w-full bg-gradient-primary hover:opacity-90 transition-opacity text-xs h-8"
          disabled={!formData.title || !formData.description || !formData.location || !formData.type || !media}
        >
          <Send className="h-3 w-3 mr-1" />
          Submit Update
        </Button>
      </div>
    </motion.div>
  );
};

export default SubmitForm;