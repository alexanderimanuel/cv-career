const BACKEND_URL = '/api/analyze';

export const analyzeWithBackend = async (data) => {
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.details || errorData.error || 'Server error';
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error("Backend Analysis Error:", error);
        throw new Error(error.message || "Failed to connect to the analysis server.");
    }
};
