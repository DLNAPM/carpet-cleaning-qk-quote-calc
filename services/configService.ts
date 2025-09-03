import type { Deal, Tip } from '../types';
import { PRICING, DEALS } from '../constants';

declare const XLSX: any;

const parseBoolean = (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.trim().toUpperCase() === 'TRUE';
    return false;
};

export const parseConfigFile = (file: File): Promise<{ pricing: typeof PRICING; deals: Deal[]; tips: Tip[] }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });

                // Start with default config
                let newPricing = { ...PRICING };
                let newDeals = [ ...DEALS ];
                let newTips: Tip[] = [];

                // Parse Pricing sheet
                const pricingSheet = workbook.Sheets['Pricing'];
                if (pricingSheet) {
                    const pricingData = XLSX.utils.sheet_to_json(pricingSheet, { header: 1 });
                    const pricingObject: { [key: string]: any } = {};
                    pricingData.forEach((row: any[]) => {
                        if (row && row.length >= 2 && typeof row[0] === 'string') {
                            pricingObject[row[0]] = parseFloat(row[1]) || row[1];
                        }
                    });
                    newPricing = { ...PRICING, ...pricingObject };
                }

                // Parse Deals sheet
                const dealsSheet = workbook.Sheets['Deals'];
                if (dealsSheet) {
                    const dealsData: any[] = XLSX.utils.sheet_to_json(dealsSheet);
                    newDeals = dealsData.map((row): Deal => ({
                        id: row.id?.toString() || '',
                        title: row.title?.toString() || 'Untitled Deal',
                        description: row.description?.toString() || '',
                        requiresFollowUp: parseBoolean(row.requiresFollowUp),
                        followUpQuestion: row.followUpQuestion?.toString(),
                        followUpType: row.followUpType as any,
                        followUpTarget: row.followUpTarget as any,
                    })).filter(d => d.id); // Filter out deals without an ID
                }

                // Parse Tips sheet
                const tipsSheet = workbook.Sheets['Tips'];
                if (tipsSheet) {
                    const tipsData: any[] = XLSX.utils.sheet_to_json(tipsSheet);
                    newTips = tipsData.map((row): Tip => ({
                        title: row.title?.toString() || 'Untitled Tip',
                        description: row.description?.toString() || '',
                    })).filter(t => t.title && t.description);
                }

                resolve({ pricing: newPricing, deals: newDeals, tips: newTips });

            } catch (error) {
                console.error("Error parsing config file:", error);
                reject(new Error("Failed to parse the configuration file. Please ensure it's a valid Excel file with 'Pricing', 'Deals', and/or 'Tips' sheets."));
            }
        };

        reader.onerror = (error) => {
            reject(new Error("Failed to read the file."));
        };

        reader.readAsBinaryString(file);
    });
};
