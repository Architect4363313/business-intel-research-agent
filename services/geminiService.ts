import type { BusinessProfile } from "../types";

export const fetchBusinessProfile = async (businessName: string, city: string): Promise<BusinessProfile> => {
    try {
        const response = await fetch('/api/business-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                businessName,
                city,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch business profile');
        }

        const profile = await response.json();
        return profile as BusinessProfile;
    } catch (error) {
        console.error("Business Profile Error:", error);
        throw new Error(error instanceof Error ? error.message : "La investigación OSINT ha fallado. Reintente.");
    }
};