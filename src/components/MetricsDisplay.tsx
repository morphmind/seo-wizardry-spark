import React from 'react';
import { Card } from '@/components/ui/card';

interface MetricsDisplayProps {
  metrics: {
    wordCount: number;
    readabilityScore: number;
  };
}

const MetricsDisplay = ({ metrics }: MetricsDisplayProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-4 bg-secondary">
        <div className="text-sm text-muted-foreground">Word Count</div>
        <div className="text-2xl font-bold text-primary">{metrics.wordCount}</div>
      </Card>
      <Card className="p-4 bg-secondary">
        <div className="text-sm text-muted-foreground">Readability Score</div>
        <div className="text-2xl font-bold text-primary">{metrics.readabilityScore}/100</div>
      </Card>
    </div>
  );
};

export default MetricsDisplay;