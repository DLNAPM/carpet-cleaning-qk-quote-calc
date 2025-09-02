
import { GoogleGenAI, Type } from "@google/genai";
import type { JobDetails } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const parseJobDescription = async (description: string): Promise<Partial<JobDetails>> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Parse the following carpet cleaning job description and extract the details into a structured JSON object. If a detail is not mentioned, omit the key or use a sensible default (0 for numbers, 1 for floors, 'first-time' for clientType, empty array for areaRugs). Description: "${description}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        distance: { type: Type.NUMBER, description: 'Distance in miles.' },
                        sqft: { type: Type.NUMBER, description: 'Total square footage for carpet cleaning.' },
                        petTreatmentRooms: { type: Type.NUMBER, description: 'Number of rooms needing pet treatment.' },
                        clientType: { type: Type.STRING, enum: ['first-time', 'repeat'], description: 'Whether the client is new or returning.' },
                        largeItems: { type: Type.NUMBER, description: 'Number of large items to move.' },
                        smallItems: { type: Type.NUMBER, description: 'Number of small/medium items to move.' },
                        areaRugs: {
                            type: Type.ARRAY,
                            description: 'A list of area rugs with their sizes.',
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    sqft: { type: Type.NUMBER, description: 'Square footage of a single rug.' }
                                }
                            }
                        },
                        floors: { type: Type.NUMBER, description: 'Number of floors in the location.' },
                        hours: { type: Type.NUMBER, description: 'Estimated hours to complete the job.' },
                        initialDiscount: { type: Type.NUMBER, description: 'Any initial flat discount amount.' }
                    }
                },
            },
        });

        const jsonString = response.text;
        const parsedJson = JSON.parse(jsonString);

        // Gemini might return an array of rugs without an id. We add it here.
        if (parsedJson.areaRugs && Array.isArray(parsedJson.areaRugs)) {
            parsedJson.areaRugs = parsedJson.areaRugs.map((rug: { sqft: number }, index: number) => ({
                id: Date.now() + index,
                sqft: rug.sqft,
            }));
        }

        return parsedJson as Partial<JobDetails>;

    } catch (error) {
        console.error("Error parsing job description with Gemini:", error);
        throw new Error("Could not understand the job description. Please fill out the form manually.");
    }
};
