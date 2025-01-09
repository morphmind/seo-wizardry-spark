import React from 'react';
import ContentAnalyzer from '@/components/ContentAnalyzer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-primary">
          AI SEO Genius
        </h1>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Optimize your content for search engines with real-time analysis and smart recommendations
        </p>
        <ContentAnalyzer />
      </div>
    </div>
  );
};

export default Index;