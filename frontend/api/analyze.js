
import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
    runtime: 'edge',
};

// Helper to try multiple models
async function maximizeAnalysis(prompt, apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Updated Model Strategy: Prioritize Stable Flash 1.5
    const modelsToTry = [
        "gemini-1.5-flash",         // STABLE & FAST (Best for Vercel)
        "gemini-2.0-flash-exp",     // Experimental
        "gemini-1.5-pro",
    ];

    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`🤖 Trying model: ${modelName}...`);
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: { responseMimeType: "application/json" }
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return JSON.parse(response.text()); // Success!
        } catch (error) {
            console.warn(`⚠️ Failed with ${modelName}: ${error.message}`);
            lastError = error;
        }
    }
    throw new Error(lastError?.message || 'All models failed to respond.');
}

export default async function handler(req) {
    // 1. Handle CORS (Edge style)
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { cvText, careerStage, isFounder } = await req.json();

        if (!cvText) {
            return new Response(JSON.stringify({ error: 'CV Text is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Access environment variable in Edge
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Server Config Error: GEMINI_API_KEY missing' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const prompt = `
            Role: Senior Tech Career Consultant & AI Architect.
            Task: Analisis CV berikut dan berikan roadmap karir strategis dalam BAHASA INDONESIA.
            IMPORTANT: OUTPUT MUST BE STRICT JSON. NO MARKDOWN.

            Candidate Profile:
            - Stage: ${careerStage || 'Unknown'}
            - Founder Interest: ${isFounder ? 'Yes' : 'No'}
            
            CV Content:
            """
            ${cvText.substring(0, 15000)} 
            """
            
            Schema:
            {
                "analysis": {
                    "matchScore": 85, 
                    "careerPath": ["Current", "Next", "Goal"], 
                    "summary": "String",
                    "strengths": [{ "skill": "String", "level": 90 }],
                    "gaps": [{ "skill": "String", "current": 30, "target": 80, "action": "String" }],
                    "recommendations": [{ "title": "String", "description": "String" }]
                }
            }
        `;

        const data = await maximizeAnalysis(prompt, apiKey);

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Final API Error:', error);
        return new Response(JSON.stringify({
            error: 'Analysis Failed',
            details: error.message || 'Unknown error occurred'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}
