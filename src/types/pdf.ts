export interface IdeaContent {
  title: string;
  description: string;
}

export interface PDFGenerationOptions {
  margin?: number;
  fontSize?: {
    title: number;
    header: number;
    content: number;
  };
  lineHeight?: number;
}

export interface PDFContent {
  topic: string;
  gpt4Ideas: IdeaContent[];
  gptMiniIdeas: IdeaContent[];
}
