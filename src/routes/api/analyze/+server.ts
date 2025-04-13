import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const POST = async ({ request }: RequestEvent) => {
  try {
    const { entries } = await request.json();
    
    // Initialize Gemini API - Fix the environment variable access
    const apiKey = import.meta.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    
    console.log("API key found, initializing Gemini...");
    const genAI = new GoogleGenerativeAI(apiKey);
    // Fix the model name - remove the tab character
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Prepare journal entries for analysis
    const journalContent = entries.map((entry: any) => 
      `Date: ${new Date(entry.createdAt.seconds * 1000).toLocaleDateString()}\nEntry: ${entry.content}`
    ).join('\n\n');
    
    // Prompt for Gemini
    const prompt = `
      Analyze the following journal entries and provide:
      1. A brief summary of the overall themes
      2. Three key insights about the person based on their writing
      3. The general sentiment (positive, negative, or neutral)
      
      Journal entries:
      ${journalContent}
      
      Format your response as JSON with the following structure:
      {
        "summary": "overall summary",
        "insights": ["insight 1", "insight 2", "insight 3"],
        "sentiment": "positive/negative/neutral"
      }
    `;
    
    // Generate content with Gemini
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Parse the JSON response from Gemini
    // The response might include markdown code blocks, so we need to extract just the JSON
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                      text.match(/```\n([\s\S]*?)\n```/) || 
                      text.match(/{[\s\S]*?}/);
                      
    let analysis;
    if (jsonMatch) {
      try {
        analysis = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch (e) {
        console.error('Failed to parse Gemini response as JSON:', e);
        analysis = {
          summary: text.substring(0, 200) + '...',
          insights: ["Could not parse structured insights"],
          sentiment: "unknown"
        };
      }
    } else {
      // Fallback if we can't extract JSON
      analysis = {
        summary: text.substring(0, 200) + '...',
        insights: ["Generated response was not in the expected format"],
        sentiment: "unknown"
      };
    }
    
    return json(analysis);
  } catch (error) {
    console.error('Error in analyze API:', error);
    return json({ error: 'Failed to analyze entries' }, { status: 500 });
  }
};