export interface ProcessedLink {
  originalText: string;
  url: string;
  anchorText: string;
  relevanceScore: number;
}

export interface ContentProcessorResult {
  processedContent: string;
  links: ProcessedLink[];
}

export interface ContentProcessorHook {
  processContent: (content: string) => Promise<ContentProcessorResult>;
  isProcessing: boolean;
  error: string | null;
}