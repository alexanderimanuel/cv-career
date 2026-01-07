
import { GoogleGenerativeAI } from '@google/generative-ai';

// Helper to try multiple models
async function maximizeAnalysis(prompt, apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Models strategy
    const modelsToTry = [
        "gemini-2.0-flash",
        "gemini-flash-latest",
        "gemini-pro-latest",
        "gemini-2.0-flash-exp"
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
            // Continue to next model
        }
    }
    // Throw the *last* error to help debug why all failed
    throw new Error(`All models failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

export default async function handler(req, res) {
    // Enable CORS for flexibility, though strictly not needed for same-origin
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

    const { cvText, careerStage, isFounder } = req.body;

    if (!cvText) {
        return res.status(400).json({ error: 'CV Text is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ FATAL: GEMINI_API_KEY is missing in environment variables");
        return res.status(500).json({ error: 'Server configuration error: API Key missing' });
    }

    // Construct the prompt (from original server.js)
    const prompt = `
        Role: Senior Tech Career Consultant & AI Architect.
        Task: Analisis CV berikut dan berikan roadmap karir strategis dalam BAHASA INDONESIA yang santai, profesional, dan mudah dipahami.
        IMPORTANT: ALL OUTPUT CONTENT MUST BE IN INDONESIAN.
        
        Candidate Profile:
        - Career Stage: ${careerStage || 'Unknown'}
        - Interested in becoming a Founder: ${isFounder ? 'Yes' : 'No'}
        
        CV Content:
        """
        ${cvText.substring(0, 15000)} 
        """
        
        Output Requirement:
        Return a valid JSON object strictly matching this schema (NO MARKDOWN BLOCK, JUST RAW JSON).
        The goal is to provide HIGHLY ACTIONABLE and VISUAL insights.

        {
            "analysis": {
                "matchScore": 85, 
                "careerPath": ["Posisi Saat Ini", "Langkah Selanjutnya", "Tujuan Akhir"], 
                "summary": "Ringkasan eksekutif profil dalam Bahasa Indonesia yang memotivasi.",
                "strengths": [ 
                    { "skill": "Nama Skill", "level": 90 }
                ],
                "gaps": [ 
                    { "skill": "Nama Skill", "current": 30, "target": 80, "action": "Saran aksi dalam Bahasa Indonesia" }
                ],
                "recommendations": [ 
                    { "title": "Area Fokus", "description": "Saran spesifik dan detail dalam Bahasa Indonesia." }
                ]
            }
        }
        
        Ensure "matchScore" is realistic based on gaps.
        Ensure "gaps" are relevant to achieving the "Next Logical Step".
    `;

    try {
        console.log("📥 Processing analysis request via Serverless function...");
        const data = await maximizeAnalysis(prompt, apiKey);
        console.log("✅ Analysis success!");
        res.status(200).json(data);
    } catch (error) {
        console.error('❌ Final API Error:', error);
        res.status(500).json({
            error: 'Analysis Failed',
            details: error.message
        });
    }
}
