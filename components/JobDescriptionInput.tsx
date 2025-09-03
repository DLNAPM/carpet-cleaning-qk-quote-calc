
import React, { useState, useEffect, useRef } from 'react';
import { useSpeech } from '../hooks/useSpeech';
import { Icon } from './common/Icon';

interface JobDescriptionInputProps {
    onSubmit: (description: string) => void;
    onFileUpload: (file: File) => void;
}

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({ onSubmit, onFileUpload }) => {
    const { isListening, transcript, startListening, stopListening, setTranscript } = useSpeech();
    const [text, setText] = useState('');
    const [uploadStatus, setUploadStatus] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileUpload(file);
            setUploadStatus(`File "${file.name}" uploaded successfully!`);
            setTimeout(() => setUploadStatus(''), 4000);
        }
        // Reset file input to allow uploading the same file again
        e.target.value = '';
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
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
                        aria-label={isListening ? 'Stop listening' : 'Start listening'}
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

            <div className="mt-6 w-full max-w-lg">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".xlsx, .xls"
                />
                <button
                    onClick={handleUploadClick}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-xl transition-colors duration-200 text-base"
                >
                    Upload Custom Config (.xlsx)
                </button>
                {uploadStatus && <p className="text-green-600 mt-2 text-sm">{uploadStatus}</p>}
            </div>
        </div>
    );
};