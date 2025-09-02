
import React from 'react';
import type { JobDetails, AppAction, AreaRug } from '../types';
import { Icon } from './common/Icon';

interface QuoteFormProps {
    jobDetails: JobDetails;
    dispatch: React.Dispatch<AppAction>;
    onComplete: () => void;
}

const InputField: React.FC<{label: string, name: keyof JobDetails, value: any, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, step?: string}> =
 ({ label, name, value, onChange, type = "number", step="any" }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            step={step}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
    </div>
);

export const QuoteForm: React.FC<QuoteFormProps> = ({ jobDetails, dispatch, onComplete }) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        dispatch({ type: 'UPDATE_JOB_DETAIL', payload: { key: name as keyof JobDetails, value: isNumber ? parseFloat(value) || 0 : value } });
    };

    const handleRugChange = (id: number, newSqft: number) => {
        const updatedRugs = jobDetails.areaRugs.map(rug => rug.id === id ? { ...rug, sqft: newSqft } : rug);
        dispatch({ type: 'UPDATE_JOB_DETAIL', payload: { key: 'areaRugs', value: updatedRugs } });
    };
    
    const addRug = () => {
        const newRug: AreaRug = { id: Date.now(), sqft: 0 };
        dispatch({ type: 'UPDATE_JOB_DETAIL', payload: { key: 'areaRugs', value: [...jobDetails.areaRugs, newRug] } });
    };
    
    const removeRug = (id: number) => {
        const updatedRugs = jobDetails.areaRugs.filter(rug => rug.id !== id);
        dispatch({ type: 'UPDATE_JOB_DETAIL', payload: { key: 'areaRugs', value: updatedRugs } });
    };

    return (
        <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Job Details</h3>
            <p className="text-gray-600 mb-6">Please fill in or confirm the details for the cleaning job.</p>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Distance (miles)" name="distance" value={jobDetails.distance} onChange={handleChange} />
                    <InputField label="Carpet Area (sq ft)" name="sqft" value={jobDetails.sqft} onChange={handleChange} />
                    <InputField label="Pet Treatment (rooms)" name="petTreatmentRooms" value={jobDetails.petTreatmentRooms} onChange={handleChange} />
                    <InputField label="Pet Stain Spots (individual)" name="petStainSpots" value={jobDetails.petStainSpots} onChange={handleChange} />
                    <InputField label="Floors" name="floors" value={jobDetails.floors} onChange={handleChange} />
                    <InputField label="Stain-Guard (rooms)" name="stainGuardRooms" value={jobDetails.stainGuardRooms} onChange={handleChange} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Large Items to Move" name="largeItems" value={jobDetails.largeItems} onChange={handleChange} />
                    <InputField label="Small/Medium Items to Move" name="smallItems" value={jobDetails.smallItems} onChange={handleChange} />
                    <InputField label="Estimated Hours" name="hours" value={jobDetails.hours} onChange={handleChange} step="0.5" />
                    <InputField label="Initial Discount ($)" name="initialDiscount" value={jobDetails.initialDiscount} onChange={handleChange} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="clientType" className="block text-sm font-medium text-gray-700">Client Type</label>
                        <select id="clientType" name="clientType" value={jobDetails.clientType} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                            <option value="first-time">First-Time</option>
                            <option value="repeat">Repeat</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="membership" className="block text-sm font-medium text-gray-700">Membership Program</label>
                        <select id="membership" name="membership" value={jobDetails.membership} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                            <option value="none">None</option>
                            <option value="6-month">6-Month</option>
                            <option value="1-year">1-Year</option>
                        </select>
                    </div>
                </div>

                <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-2">Area Rugs</h4>
                    <div className="space-y-3">
                        {jobDetails.areaRugs.map((rug, index) => (
                            <div key={rug.id} className="flex items-center gap-4">
                               <span className="font-semibold text-gray-600">Rug {index + 1}:</span>
                                <input type="number" value={rug.sqft} onChange={(e) => handleRugChange(rug.id, parseFloat(e.target.value) || 0)} className="flex-grow mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="sq ft"/>
                                <button onClick={() => removeRug(rug.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
                                    <Icon name="trash" size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button onClick={addRug} className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold">
                       <Icon name="plus" size={16} /> Add Area Rug
                    </button>
                </div>
            </div>

            <button
                onClick={onComplete}
                className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 text-lg"
            >
                Next: Service Recommendations
            </button>
        </div>
    );
};
