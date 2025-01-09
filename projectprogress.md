# Project Technical Documentation

## Overview
AI SEO Genius is a comprehensive SEO and content generation tool that integrates multiple AI services and APIs to help users create, optimize, and manage content. The application is built using React, TypeScript, and Vite with a modern component architecture.

## Core Features

### 1. Content Generation
- Uses OpenAI GPT-4o-mini and o1-mini APIs for content generation
- Supports multiple content types:
  - Blog posts
  - Listicles
  - FAQ sections
  - Meta descriptions
  - SEO titles
- Implements intelligent content optimization using AI analysis

### 2. Image Generation
- Integrates with Recraft.ai API for AI image generation
- Supports multiple image styles and sizes
- Includes automatic alt text generation

### 3. Internal Linking System
- Analyzes content using OpenAI API for context understanding
- Implements smart link placement algorithm
- Generates natural anchor text
- Provides link relevancy scoring

### 4. URL Analysis
- Performs comprehensive URL analysis
- Extracts metadata and content
- Generates SEO recommendations
- Supports sitemap parsing and bulk URL processing

## API Integrations

### OpenAI API
- Location: `src/utils/openai.ts`
- Used for:
  - Content generation
  - Content analysis
  - Keyword extraction
  - Natural language processing

### Recraft.ai API
- Location: `src/components/ImagePromptGenerator.tsx`
- Used for:
  - AI image generation
  - Image style customization
  - Image prompt optimization

### Koala.sh API
- Location: `src/pages/content-writer/index.tsx`
- Used for:
  - Advanced SEO content generation
  - Content optimization
  - Article structure generation

## Security Features

### Authentication System
- Location: `src/contexts/AuthContext.tsx`
- Features:
  - Password-based authentication
  - Settings access control
  - Secure storage of credentials

### Secure Storage
- Location: `src/utils/secureStorage.ts`
- Implements:
  - AES-GCM encryption
  - Secure key management
  - Encrypted local storage

## Data Management

### State Management
- Uses React Context for global state
- Implements custom hooks for specific functionalities
- Manages form state using React Hook Form

### Data Persistence
- Implements secure local storage
- Manages API keys securely
- Stores user preferences and presets

## Technical Architecture

### Frontend Architecture
- Built with React and TypeScript
- Uses Vite for development and building
- Implements shadcn/ui components
- Uses Tailwind CSS for styling

### File Organization
- Components: Reusable UI components
- Contexts: Global state management
- Hooks: Custom React hooks
- Utils: Utility functions and API integrations
- Types: TypeScript type definitions

### Key Components

#### ContentGenerator
- Location: `src/components/ContentGenerator.tsx`
- Purpose: Main content generation interface
- Features:
  - Multiple content type support
  - AI model selection
  - Content customization options

#### ImagePromptGenerator
- Location: `src/components/ImagePromptGenerator.tsx`
- Purpose: AI image generation interface
- Features:
  - Multiple image styles
  - Size customization
  - Prompt optimization

#### InternalLinkGenerator
- Location: `src/components/InternalLinkGenerator.tsx`
- Purpose: Smart internal linking system
- Features:
  - Content analysis
  - Link relevancy scoring
  - Natural anchor text generation

## Performance Optimizations

### Code Splitting
- Implements dynamic imports
- Lazy loads components
- Optimizes bundle size

### Caching
- Implements response caching
- Stores API responses
- Caches generated content

### Error Handling
- Implements comprehensive error boundaries
- Provides user-friendly error messages
- Includes fallback mechanisms

## Development Guidelines

### Code Structure
- Follows component-based architecture
- Implements clean code principles
- Uses TypeScript for type safety

### Best Practices
- Follows React best practices
- Implements proper error handling
- Uses proper TypeScript types
- Follows security best practices

### Testing
- Implements unit tests
- Includes integration tests
- Provides test coverage

## Parallel GPT Model Usage Example

### Content Ideas Generation with Multiple Models
Location: `src/utils/openai.ts`

The application implements a successful pattern for using multiple GPT models in parallel to generate diverse content ideas. Here's how it works:

```typescript
export const generateIdeasWithOpenAI = async (
  topic: string,
  apiKey: string
): Promise<{ gpt4Ideas: IdeaResult[]; gptMiniIdeas: IdeaResult[] }> => {
  // Common prompt for both models
  const systemPrompt = "Sen bir SEO ve içerik uzmanısın...";
  const userPrompt = `Konu: ${topic}\n\nBu konuyla ilgili...`;

  try {
    // GPT-4 Request
    const gpt4Response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7
      })
    });

    // GPT-3.5 Request
    const gptMiniResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "o1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.9
      })
    });

    // Process both responses
    const [gpt4Data, gptMiniData] = await Promise.all([
      gpt4Response.json(),
      gptMiniResponse.json()
    ]);

    return {
      gpt4Ideas: parseResponse(gpt4Data),
      gptMiniIdeas: parseResponse(gptMiniData)
    };
  } catch (error) {
    // Error handling
  }
};
```

#### Key Implementation Points:

1. **Shared Prompts**: Both models use the same system and user prompts for consistency
2. **Different Temperatures**: 
   - GPT-4: 0.7 (more focused)
   - GPT-3.5: 0.9 (more creative)
3. **Parallel Processing**: Uses Promise.all for concurrent API calls
4. **Response Parsing**: Common parsing logic for both model outputs
5. **Error Handling**: Comprehensive error handling for both API calls

#### Benefits:

- Diverse perspectives from different models
- Improved response time through parallel processing
- Consistent prompt structure across models
- Unified error handling and response parsing

This pattern can be reused when implementing other features that require multiple AI model perspectives.
