import React, { useMemo } from 'react';
import type { JobDetails, DealResponse, Deal, Tip } from '../types';
import type { PRICING as PricingType } from '../constants';

interface QuoteSummaryProps {
    jobDetails: JobDetails;
    dealResponses: DealResponse[];
    pricing: typeof PricingType;
    deals: Deal[];
    tips: Tip[];
    onNext: () => void;
    onBack: () => void;
    isPreview?: boolean;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export const QuoteSummary: React.FC<QuoteSummaryProps> = ({ jobDetails, dealResponses, pricing, deals, tips, onNext, onBack, isPreview = false }) => {
    const calculation = useMemo(() => {
        let subtotal = 0;
        const breakdown: { item: string, cost: number }[] = [];
        
        // Base carpet cleaning
        if (jobDetails.sqft > 0) {
            subtotal += pricing.BASE_RATE;
            breakdown.push({ item: `Carpet Cleaning (up to ${pricing.BASE_SQFT} sq ft)`, cost: pricing.BASE_RATE });
            if (jobDetails.sqft > pricing.BASE_SQFT) {
                const extraSqft = jobDetails.sqft - pricing.BASE_SQFT;
                const extraCost = extraSqft * pricing.ADDITIONAL_SQFT_RATE;
                subtotal += extraCost;
                breakdown.push({ item: `Additional ${extraSqft} sq ft`, cost: extraCost });
            }
        }

        // Other services
        const services = [
            { condition: jobDetails.distance > pricing.DISTANCE_BASE_MILES, cost: (jobDetails.distance - pricing.DISTANCE_BASE_MILES) * pricing.DISTANCE_RATE_PER_MILE, item: `Distance Surcharge (${jobDetails.distance} miles)` },
            { condition: jobDetails.petTreatmentRooms > 0, cost: jobDetails.petTreatmentRooms * pricing.PET_TREATMENT_PER_ROOM, item: `Pet Treatment (${jobDetails.petTreatmentRooms} rooms)` },
            { condition: jobDetails.largeItems > 0, cost: jobDetails.largeItems * pricing.LARGE_ITEM_MOVE, item: `Large Items Moved (${jobDetails.largeItems})` },
            { condition: jobDetails.smallItems > 0, cost: jobDetails.smallItems * pricing.SMALL_ITEM_MOVE, item: `Small/Medium Items Moved (${jobDetails.smallItems})` },
            { condition: jobDetails.floors > 1, cost: (jobDetails.floors - 1) * pricing.FLOOR_SURCHARGE, item: `Multi-floor Surcharge (${jobDetails.floors} floors)` },
            { condition: jobDetails.petStainSpots > 0, cost: jobDetails.petStainSpots * pricing.STAIN_SPOT, item: `Pet Stain Spots (${jobDetails.petStainSpots})` },
            { condition: jobDetails.stainGuardRooms > 0, cost: jobDetails.stainGuardRooms * pricing.STAIN_GUARD_PER_ROOM, item: `Stain-Guard (${jobDetails.stainGuardRooms} rooms)` },
            { condition: jobDetails.sofas > 0, cost: jobDetails.sofas * pricing.SOFA_CLEANING, item: `Sofa Cleaning (${jobDetails.sofas})` },
            { condition: jobDetails.loveSeats > 0, cost: jobDetails.loveSeats * pricing.LOVESEAT_CLEANING, item: `Loveseat Cleaning (${jobDetails.loveSeats})` },
            { condition: jobDetails.armchairs > 0, cost: jobDetails.armchairs * pricing.ARMCHAIR_CLEANING, item: `Armchair Cleaning (${jobDetails.armchairs})` },
        ];

        services.forEach(service => {
            if(service.condition) {
                subtotal += service.cost;
                breakdown.push({ item: service.item, cost: service.cost });
            }
        });

        jobDetails.areaRugs.forEach((rug, i) => {
            const cost = rug.sqft * pricing.AREA_RUG_PER_SQFT;
            subtotal += cost;
            breakdown.push({ item: `Area Rug #${i + 1} (${rug.sqft} sq ft)`, cost });
        });
        
        // Discounts
        let totalDiscount = jobDetails.initialDiscount;
        const discountSummary: { item: string, saving: number }[] = [];
        if(jobDetails.initialDiscount > 0) {
            discountSummary.push({ item: `Initial Discount`, saving: jobDetails.initialDiscount });
        }
        
        // Membership discount
        if (jobDetails.membership === '1-year') {
            const discount = subtotal * pricing.MEMBERSHIP_YEAR_DISCOUNT;
            totalDiscount += discount;
            discountSummary.push({ item: '1-Year Membership Discount (15%)', saving: discount });
        } else if (jobDetails.membership === '6-month') {
            const discount = subtotal * pricing.MEMBERSHIP_6_MONTH_DISCOUNT;
            totalDiscount += discount;
            discountSummary.push({ item: '6-Month Membership Discount (10%)', saving: discount });
        }

        // Deal discounts
        const acceptedDeals = dealResponses.filter(dr => dr.accepted).map(dr => deals.find(d => d.id === dr.id));
        
        // Handle exclusive deals first
        const exclusiveDeal25 = acceptedDeals.find(d => d?.id === 'bundle2');
        const exclusiveDeal15 = acceptedDeals.find(d => d?.id === 'bundle4');
        
        if (exclusiveDeal25) {
            const discount = subtotal * 0.25;
            totalDiscount += discount;
            discountSummary.push({ item: 'Ultimate Clean Package (25%)', saving: discount });
        } else if (exclusiveDeal15) {
             const discount = subtotal * 0.15;
            totalDiscount += discount;
            discountSummary.push({ item: 'Premium Protection Bundle (15%)', saving: discount });
        } else {
            // Additive deals if no exclusive deal is taken
            acceptedDeals.forEach(deal => {
                if (deal?.id === 'bundle1' && jobDetails.sqft > 0 && jobDetails.areaRugs.length > 0 && jobDetails.stainGuardRooms > 0) {
                    const discount = subtotal * 0.10;
                    totalDiscount += discount;
                    discountSummary.push({ item: 'Carpet + Rugs + Stain Guard Bundle (10%)', saving: discount });
                }
                if (deal?.id === 'social_media') {
                    totalDiscount += 10;
                    discountSummary.push({ item: 'Social Media Share', saving: 10 });
                }
                if (deal?.id === 'bundle3') {
                    totalDiscount += 55.55;
                    discountSummary.push({ item: 'Pet & Upholstery Bundle', saving: 55.55 });
                }
                // Other deals like referrals are noted but discount applied on future jobs
            });
        }
        
        const finalTotal = Math.max(0, subtotal - totalDiscount);

        return { subtotal, totalDiscount, finalTotal, breakdown, discountSummary };
    }, [jobDetails, dealResponses, pricing, deals]);

    const notes = dealResponses
        .filter(dr => dr.accepted && dr.details)
        .map(dr => {
            const deal = deals.find(d => d.id === dr.id);
            return { title: deal?.title || 'Note', detail: dr.details };
        });

    return (
        <div className="space-y-8" id="quote-summary">
            <div>
                <h3 className="text-3xl font-extrabold text-gray-900 text-center mb-6">Your Quick Quote</h3>
                <div className="bg-gray-50 p-6 rounded-xl shadow-md">
                    <h4 className="font-bold text-xl mb-4 text-gray-700">Cost Breakdown</h4>
                    <ul className="space-y-2">
                        {calculation.breakdown.map((item, i) => (
                            <li key={i} className="flex justify-between items-center text-gray-600">
                                <span>{item.item}</span>
                                <span className="font-mono">{formatCurrency(item.cost)}</span>
                            </li>
                        ))}
                    </ul>
                    <hr className="my-4"/>
                    <div className="flex justify-between items-center font-bold text-lg text-gray-800">
                        <span>Subtotal</span>
                        <span className="font-mono">{formatCurrency(calculation.subtotal)}</span>
                    </div>
                </div>
            </div>

            <div>
                 <div className="bg-green-50 p-6 rounded-xl shadow-md">
                    <h4 className="font-bold text-xl mb-4 text-green-800">Discount Summary</h4>
                     {calculation.discountSummary.length > 0 ? (
                        <ul className="space-y-2">
                            {calculation.discountSummary.map((item, i) => (
                                <li key={i} className="flex justify-between items-center text-green-700">
                                    <span>{item.item}</span>
                                    <span className="font-mono">(-{formatCurrency(item.saving)})</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 italic">No discounts applied.</p>
                    )}
                    <hr className="my-4 border-green-200"/>
                    <div className="flex justify-between items-center font-bold text-lg text-green-800">
                        <span>Total Savings</span>
                        <span className="font-mono">{formatCurrency(calculation.totalDiscount)}</span>
                    </div>
                </div>
            </div>

            <div className="text-center bg-blue-600 text-white p-6 rounded-xl shadow-xl">
                <p className="text-xl font-semibold">Estimated Total</p>
                <p className="text-5xl font-extrabold tracking-tight font-mono">{formatCurrency(calculation.finalTotal)}</p>
            </div>
            
            {tips.length > 0 && (
                <div className="bg-yellow-50 p-6 rounded-xl shadow-md">
                    <h4 className="font-bold text-xl mb-4 text-yellow-800">Helpful Tips & Recommendations</h4>
                    <ul className="space-y-3">
                        {tips.map((tip, i) => (
                            <li key={i} className="text-yellow-900">
                                <strong className="block">{tip.title}</strong>
                                <p className="text-sm">{tip.description}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold text-lg mb-2">Upsell Responses</h4>
                    <ul className="space-y-1 text-sm">
                        {deals.map(deal => {
                            const response = dealResponses.find(r => r.id === deal.id);
                            return (
                                <li key={deal.id} className="flex justify-between">
                                    <span className="text-gray-700 w-3/4">{deal.title}</span>
                                    {response?.accepted ? <span className="font-semibold text-green-600">Accepted</span> : <span className="font-semibold text-red-600">Declined</span>}
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold text-lg mb-2">Notes</h4>
                    {notes.length > 0 ? (
                        <ul className="space-y-2 text-sm">
                            {notes.map((note, i) => (
                                <li key={i}><strong className="text-gray-700">{note.title}:</strong> <span className="text-gray-600">{note.detail}</span></li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 italic">No additional notes.</p>
                    )}
                </div>
            </div>

            {!isPreview && (
                <div className="flex justify-between mt-8">
                    <button onClick={onBack} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Back</button>
                    <button onClick={onNext} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">Email Quote</button>
                </div>
            )}
        </div>
    );
};