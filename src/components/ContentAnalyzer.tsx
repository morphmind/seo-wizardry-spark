import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import MetricsDisplay from './MetricsDisplay';
import RecommendationsPanel from './RecommendationsPanel';

const ContentAnalyzer = () => {
  const [content, setContent] = useState('');
  const [metrics, setMetrics] = useState({
    wordCount: 0,
    readabilityScore: 0,
  });

  useEffect(() => {
    // Calculate metrics
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    
    // Simple readability score (0-100) based on average word length
    const avgWordLength = words.length > 0 
      ? words.join('').length / words.length 
      : 0;
    const readabilityScore = Math.max(0, Math.min(100, 100 - (avgWordLength - 5) * 10));

    setMetrics({
      wordCount,
      readabilityScore: Math.round(readabilityScore),
    });
  }, [content]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-4">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Content Analyzer</h2>
        <Textarea
          placeholder="Enter your content here..."
          className="min-h-[200px] mb-4"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <MetricsDisplay metrics={metrics} />
      </Card>
      <RecommendationsPanel content={content} metrics={metrics} />
    </div>
  );
};

export default ContentAnalyzer;