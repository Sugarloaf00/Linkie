
import { Injectable, signal } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';
import { environment } from '../environments/environment';

// A mock environment file would typically hold the API key.
// For this applet, we assume `process.env.API_KEY` is available globally.
declare const process: any;

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;
  public error = signal<string | null>(null);
  public loading = signal<boolean>(false);

  constructor() {
    try {
      if (typeof process !== 'undefined' && process.env?.API_KEY) {
        this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      } else {
        throw new Error('API_KEY environment variable not found.');
      }
    } catch (e: any) {
      console.error('Error initializing Gemini Service:', e);
      this.error.set('Failed to initialize Gemini AI Service. Please ensure the API key is configured.');
    }
  }

  async generateLinkDetails(url: string): Promise<{ title: string; description: string } | null> {
    if (!this.ai) {
      this.error.set('Gemini AI Service is not available.');
      return null;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on the URL "${url}", generate a plausible and concise title (max 10 words) and a short, one-sentence summary for a tech or news article that might be found there.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: 'A plausible title for the article.'
              },
              description: {
                type: Type.STRING,
                description: 'A one-sentence summary of the article.'
              },
            },
            required: ['title', 'description'],
          },
        },
      });

      const jsonString = response.text.trim();
      const details = JSON.parse(jsonString);
      return details;
    } catch (e: any) {
      console.error('Error generating link details:', e);
      this.error.set('Could not fetch details for the link. Please try again.');
      return null;
    } finally {
      this.loading.set(false);
    }
  }
}
