
import React, { useState } from 'react';
import type { DealResponse, AppAction, JobDetails } from '../types';
import { DEALS } from '../constants';
import { Modal } from './common/Modal';

interface DealsSectionProps {
    dealResponses: DealResponse[];
    dispatch: React.Dispatch<AppAction>;
    jobDetails: JobDetails;
    onComplete: () => void;
}

export const DealsSection: React.FC<DealsSectionProps> = ({ dealResponses, dispatch, jobDetails, onComplete }) => {
    const [modalDealId, setModalDealId] = useState<string | null>(null);

    const handleToggle = (id: string, accepted: boolean) => {
        const deal = DEALS.find(d => d.id === id);
        let requiresFollowUp = false;
        if (typeof deal?.requiresFollowUp === 'function') {
            requiresFollowUp = deal.requiresFollowUp(jobDetails);
        } else {
            requiresFollowUp = !!deal?.requiresFollowUp;
        }

        const updatedResponses = dealResponses.map(r => r.id === id ? { ...r, accepted } : r);
        dispatch({ type: 'SET_DEAL_RESPONSES', payload: updatedResponses });

        if (accepted && requiresFollowUp) {
            setModalDealId(id);
        }
    };
    
    const handleModalSubmit = (id: string, details?: string | number | { sofas: number; loveSeats: number; armchairs: number; }) => {
        const deal = DEALS.find(d => d.id === id);
        let detailsForResponse: string | number = '';

        if (deal?.followUpType === 'number' && deal.followUpTarget) {
            dispatch({ type: 'UPDATE_JOB_DETAIL', payload: { key: deal.followUpTarget, value: details } });
            detailsForResponse = typeof details === 'number' ? details : '';
        } else if (deal?.followUpType === 'upholstery' && typeof details === 'object' && details !== null && 'sofas' in details) {
            Object.entries(details).forEach(([key, value]) => {
                dispatch({type: 'UPDATE_JOB_DETAIL', payload: { key: key as keyof JobDetails, value: value }});
            });
            detailsForResponse = `Sofas: ${details.sofas}, Love Seats: ${details.loveSeats}, Armchairs: ${details.armchairs}`;
        } else if (typeof details === 'string' || typeof details === 'number') {
            detailsForResponse = details;
        }
        
        const updatedResponses = dealResponses.map(r => r.id === id ? { ...r, details: detailsForResponse } : r);
        dispatch({ type: 'SET_DEAL_RESPONSES', payload: updatedResponses });
        setModalDealId(null);
    };

    const currentDeal = DEALS.find(d => d.id === modalDealId);

    return (
        <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Service Recommendations</h3>
            <p className="text-gray-600 mb-6">Please answer yes or no to the following offers.</p>

            <div className="space-y-4">
                {DEALS.map(deal => {
                    const response = dealResponses.find(r => r.id === deal.id);
                    return (
                        <div key={deal.id} className="p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
                            <h4 className="font-bold text-blue-700">{deal.title}</h4>
                            <p className="text-gray-600 my-2">{deal.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                                <button
                                    onClick={() => handleToggle(deal.id, true)}
                                    className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors ${response?.accepted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-green-100'}`}
                                >
                                    Yes
                                </button>
                                <button
                                    onClick={() => handleToggle(deal.id, false)}
                                    className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors ${!response?.accepted ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-red-100'}`}
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {currentDeal && (
                <Modal
                    deal={currentDeal}
                    onClose={() => setModalDealId(null)}
                    onSubmit={handleModalSubmit}
                />
            )}

            <button
                onClick={onComplete}
                className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 text-lg"
            >
                Generate Quote
            </button>
        </div>
    );
};
