import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SubmitForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Report Submitted",
      description: "Your city update has been submitted successfully.",
    });

    setFormData({
      title: '',
      description: '',
      location: '',
      type: ''
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="space-y-2">
          <Label htmlFor="location" className="text-xs font-medium">Location</Label>
          <div className="relative">
            <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              id="location"
              placeholder="Address or coordinates"
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

        <Button 
          type="submit" 
          size="sm"
          className="w-full bg-gradient-primary hover:opacity-90 transition-opacity text-xs h-8"
          disabled={!formData.title || !formData.description || !formData.location || !formData.type}
        >
          <Send className="h-3 w-3 mr-1" />
          Submit Update
        </Button>
      </form>
    </motion.div>
  );
};

export default SubmitForm;