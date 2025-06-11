// This file can be used for shared TypeScript types and interfaces.
// For now, most prop types are defined locally in components.

export interface SampleType {
  id: string;
  value: string;
}

// Add more shared types as the application grows.
// For example, if the Gemini response structure was complex and parsed here:
// export interface GeminiOptimizedText {
//   text: string;
//   emojiCount: number;
//   charCount: number;
// }