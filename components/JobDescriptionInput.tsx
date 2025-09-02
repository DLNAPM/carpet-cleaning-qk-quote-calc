
import React, { useState, useEffect } from 'react';
import { useSpeech } from '../hooks/useSpeech';
import { Icon } from './common/Icon';

interface JobDescriptionInputProps {
    onSubmit: (description: string) => void;
}

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({ onSubmit }) => {
    const { isListening, transcript, startListening, stopListening, setTranscript } = useSpeech();
    const [text, setText] = useState('');

    useEffect(() => {
        setText(transcript);
    }, [transcript]);

    const handleMicClick = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(text);
    };

    return (
        <div className="flex flex-col items-center text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Describe the Job</h3>
            <p className="text-gray-600 mb-6">You can either speak or type the job details below. Press Enter or click the button when you're done.</p>

            <form onSubmit={handleSubmit} className="w-full max-w-lg">
                <div className="relative">
                    <textarea
                        value={text}
                        onChange={(e) => {
                            setTranscript(e.target.value);
                            setText(e.target.value);
                        }}
                        placeholder="e.g., '50 miles away, 880 sq ft, pet treatment in 3 rooms, 3 large items to move...'"
                        className="w-full h-40 p-4 pr-16 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 resize-none text-lg"
                        onKeyDown={(e) => {
                            if(e.key === 'Enter' && !e.shiftKey) {
                                handleSubmit(e);
                            }
                        }}
                    />
                    <button
                        type="button"
                        onClick={handleMicClick}
                        className={`absolute top-1/2 right-4 -translate-y-1/2 p-3 rounded-full transition-colors duration-200 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                    >
                        <Icon name={isListening ? 'micOff' : 'mic'} size={24} />
                    </button>
                </div>
                <button
                    type="submit"
                    className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 text-lg"
                >
                    Continue
                </button>
            </form>
        </div>
    );
};
