
import React, { useState, useReducer, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { JobDescriptionInput } from './components/JobDescriptionInput';
import { QuoteForm } from './components/QuoteForm';
import { DealsSection } from './components/DealsSection';
import { QuoteSummary } from './components/QuoteSummary';
import { EmailQuote } from './components/EmailQuote';
import { Spinner } from './components/common/Spinner';
import { useSpeech } from './hooks/useSpeech';
import { parseJobDescription } from './services/geminiService';
import { parseConfigFile } from './services/configService';
import type { JobDetails, DealResponse, AppState, AppAction, Tip } from './types';
import { DEALS, PRICING } from './constants';

const initialState: AppState = {
    step: 'description',
    jobDetails: {
        distance: 0,
        sqft: 0,
        petTreatmentRooms: 0,
        clientType: 'first-time',
        largeItems: 0,
        smallItems: 0,
        areaRugs: [],
        floors: 1,
        hours: 0,
        initialDiscount: 0,
        petStainSpots: 0,
        stainGuardRooms: 0,
        membership: 'none',
        sofas: 0,
        loveSeats: 0,
        armchairs: 0,
    },
    dealResponses: DEALS.map(deal => ({ id: deal.id, accepted: false, details: '' })),
    isLoading: false,
    error: null,
    pricing: PRICING,
    deals: DEALS,
    tips: [],
};

function appReducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
        case 'START_LOADING':
            return { ...state, isLoading: true, error: null };
        case 'SET_STEP':
            return { ...state, step: action.payload };
        case 'SET_JOB_DETAILS':
            return { ...state, jobDetails: { ...state.jobDetails, ...action.payload }, isLoading: false };
        case 'UPDATE_JOB_DETAIL':
            return { ...state, jobDetails: { ...state.jobDetails, [action.payload.key]: action.payload.value } };
        case 'SET_DEAL_RESPONSES':
            return { ...state, dealResponses: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload, isLoading: false };
        case 'RESET':
            // Keep the custom config when resetting
            return { 
                ...initialState, 
                pricing: state.pricing, 
                deals: state.deals, 
                tips: state.tips,
                dealResponses: state.deals.map(deal => ({ id: deal.id, accepted: false, details: '' }))
            };
        case 'SET_CONFIG':
            return { 
                ...state, 
                pricing: action.payload.pricing,
                deals: action.payload.deals,
                tips: action.payload.tips,
                // Reset deal responses to match the new deals
                dealResponses: action.payload.deals.map(deal => ({ id: deal.id, accepted: false, details: '' })),
                isLoading: false 
            };
        default:
            return state;
    }
}

const App: React.FC = () => {
    const [state, dispatch] = useReducer(appReducer, initialState);
    const { speak } = useSpeech();

    useEffect(() => {
        if (state.step === 'description') {
            speak("Welcome to the Carpet Cleaning Quick Quote Calculator! Please describe your job, or press enter to fill out the form.");
        }
    }, [state.step, speak]);

    const handleDescriptionSubmit = async (description: string) => {
        dispatch({ type: 'START_LOADING' });
        if (description.trim() === '') {
            dispatch({ type: 'SET_STEP', payload: 'form' });
            dispatch({ type: 'SET_JOB_DETAILS', payload: {} });
        } else {
            try {
                const parsedDetails = await parseJobDescription(description);
                dispatch({ type: 'SET_JOB_DETAILS', payload: parsedDetails });
                dispatch({ type: 'SET_STEP', payload: 'form' });
            } catch (err) {
                const error = err instanceof Error ? err : new Error('An unknown error occurred');
                dispatch({ type: 'SET_ERROR', payload: `Failed to parse description: ${error.message}` });
                 // Fallback to form if Gemini fails
                dispatch({ type: 'SET_STEP', payload: 'form' });
            }
        }
    };

    const handleConfigFileUpload = async (file: File) => {
        dispatch({ type: 'START_LOADING' });
        try {
            const config = await parseConfigFile(file);
            dispatch({ type: 'SET_CONFIG', payload: config });
        } catch (err) {
            const error = err instanceof Error ? err : new Error('An unknown error occurred');
            dispatch({ type: 'SET_ERROR', payload: error.message });
        }
    };

    const renderStep = () => {
        if (state.isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <Spinner />
                    <p className="mt-4 text-gray-600">Processing your request...</p>
                </div>
            );
        }

        switch (state.step) {
            case 'description':
                return <JobDescriptionInput onSubmit={handleDescriptionSubmit} onFileUpload={handleConfigFileUpload} />;
            case 'form':
                return <QuoteForm
                    jobDetails={state.jobDetails}
                    dispatch={dispatch}
                    onComplete={() => dispatch({ type: 'SET_STEP', payload: 'deals' })}
                />;
            case 'deals':
                return <DealsSection
                    deals={state.deals}
                    dealResponses={state.dealResponses}
                    dispatch={dispatch}
                    jobDetails={state.jobDetails}
                    onComplete={() => dispatch({ type: 'SET_STEP', payload: 'summary' })}
                />;
            case 'summary':
                return <QuoteSummary
                    jobDetails={state.jobDetails}
                    dealResponses={state.dealResponses}
                    pricing={state.pricing}
                    deals={state.deals}
                    tips={state.tips}
                    onNext={() => dispatch({ type: 'SET_STEP', payload: 'email' })}
                    onBack={() => dispatch({ type: 'SET_STEP', payload: 'deals' })}
                />;
            case 'email':
                return <EmailQuote
                    jobDetails={state.jobDetails}
                    dealResponses={state.dealResponses}
                    pricing={state.pricing}
                    deals={state.deals}
                    tips={state.tips}
                    onBack={() => dispatch({ type: 'SET_STEP', payload: 'summary' })}
                    onReset={() => dispatch({ type: 'RESET' })}
                />;
            default:
                return <div>Invalid step</div>;
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600 tracking-tight">Carpet Cleaning</h1>
                    <h2 className="text-2xl sm:text-3xl font-semibold text-gray-700">Quick Quote Calculator</h2>
                </header>
                <main className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 transition-all duration-500">
                    {state.error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">{state.error}</div>}
                    {renderStep()}
                </main>
                <footer className="text-center mt-8 text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Clean Carpets Inc. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
};

export default App;