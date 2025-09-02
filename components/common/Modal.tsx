
import React, { useState } from 'react';
import type { Deal } from '../../types';

interface ModalProps {
    deal: Deal;
    onClose: () => void;
    onSubmit: (id: string, details?: string | number | { sofas: number; loveSeats: number; armchairs: number; }) => void;
}

export const Modal: React.FC<ModalProps> = ({ deal, onClose, onSubmit }) => {
    const [details, setDetails] = useState<string | number>('');
    const [upholstery, setUpholstery] = useState({ sofas: 0, loveSeats: 0, armchairs: 0 });
    
    const handleSubmit = () => {
        if (deal.followUpType === 'upholstery') {
            onSubmit(deal.id, upholstery);
        } else {
            onSubmit(deal.id, details);
        }
    };
    
    const renderInput = () => {
        if (deal.followUpType === 'upholstery') {
            return (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Sofas</label>
                        <input type="number" min="0" value={upholstery.sofas} onChange={e => setUpholstery({...upholstery, sofas: parseInt(e.target.value) || 0})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Love Seats</label>
                        <input type="number" min="0" value={upholstery.loveSeats} onChange={e => setUpholstery({...upholstery, loveSeats: parseInt(e.target.value) || 0})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Armchairs</label>
                        <input type="number" min="0" value={upholstery.armchairs} onChange={e => setUpholstery({...upholstery, armchairs: parseInt(e.target.value) || 0})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                </div>
            )
        }
        
        return deal.followUpType === 'number' ? (
             <input type="number" value={details} onChange={e => setDetails(parseInt(e.target.value) || 0)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        ) : (
            <textarea value={details.toString()} onChange={e => setDetails(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        );
    }
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold mb-2">{deal.title}</h3>
                <p className="text-gray-600 mb-4">{deal.followUpQuestion}</p>
                {renderInput()}
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Submit</button>
                </div>
            </div>
        </div>
    );
};
