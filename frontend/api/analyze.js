
import { GoogleGenerativeAI } from '@google/generative-ai';

// Remove Edge config to use default Node.js Serverless
// export const config = { runtime: 'edge' };

// Helper to try multiple models
async function maximizeAnalysis(prompt, apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Updated Model Strategy: Comprehensive fallback list with SPECIFIC versions
    const modelsToTry = [
        "gemini-1.5-flash-001",     // Specific Version (Most Reliable)
        "gemini-1.5-flash",         // Alias
        "gemini-1.5-pro-001",       // Specific Version
        "gemini-pro",               // Legacy
        "gemini-1.0-pro"            // Legacy Alternate
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

export default async function handler(req, res) {
    // 1. Handle CORS (Node.js style)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { cvText, careerStage, isFounder } = req.body;

        if (!cvText) {
            return res.status(400).json({ error: 'CV Text is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("❌ GEMINI_API_KEY missing");
            return res.status(500).json({ error: 'Server Config Error: GEMINI_API_KEY missing' });
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

        return res.status(200).json(data);

    } catch (error) {
        console.error('Final API Error:', error);
        return res.status(500).json({
            error: 'Analysis Failed',
            details: error.message || 'Unknown error occurred'
        });
    }
}
