import React from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface RecommendationsPanelProps {
  content: string;
  metrics: {
    wordCount: number;
    readabilityScore: number;
  };
}

const RecommendationsPanel = ({ content, metrics }: RecommendationsPanelProps) => {
  const recommendations = [
    {
      check: metrics.wordCount >= 300,
      message: 'Content length should be at least 300 words',
    },
    {
      check: metrics.readabilityScore >= 60,
      message: 'Content should be easy to read (score > 60)',
    },
    {
      check: content.includes('h1') || content.includes('h2'),
      message: 'Include headings for better structure',
    },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">SEO Recommendations</h3>
      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <div key={index} className="flex items-center gap-2">
            {rec.check ? (
              <CheckCircle className="text-green-500 h-5 w-5" />
            ) : (
              <AlertCircle className="text-amber-500 h-5 w-5" />
            )}
            <span className={rec.check ? 'text-green-700' : 'text-amber-700'}>
              {rec.message}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RecommendationsPanel;