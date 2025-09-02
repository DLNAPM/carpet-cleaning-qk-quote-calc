
import React, { useState, useRef, useCallback } from 'react';
import { QuoteSummary } from './QuoteSummary';
import type { JobDetails, DealResponse } from '../types';

declare const jspdf: any;
declare const html2canvas: any;

interface EmailQuoteProps {
    jobDetails: JobDetails;
    dealResponses: DealResponse[];
    onBack: () => void;
    onReset: () => void;
}

export const EmailQuote: React.FC<EmailQuoteProps> = ({ jobDetails, dealResponses, onBack, onReset }) => {
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('Your Carpet Cleaning Quote');
    const [body, setBody] = useState('Please find your quote attached.');
    const [isSending, setIsSending] = useState(false);
    const quoteRef = useRef<HTMLDivElement>(null);

    const handleSendQuote = async () => {
        if (!quoteRef.current) return;
        setIsSending(true);

        try {
            const canvas = await html2canvas(quoteRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            
            const { jsPDF } = jspdf;
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            // In a real app, you would upload this PDF or send it via an email API
            // For this demo, we'll just download it and show a success message.
            pdf.save('carpet-cleaning-quote.pdf');

            alert(`Email simulation: \nTo: ${email}\nSubject: ${subject}\nBody: ${body}\n\nQuote PDF has been downloaded.`);
            
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setIsSending(false);
        }
    };
    
    // This is a dummy onNext for QuoteSummary as it's just for display here
    const dummyFunc = () => {};

    return (
        <div className="space-y-8">
            <h3 className="text-2xl font-bold text-gray-800">Email Quote to Customer</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Email Details</h4>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Customer Email</label>
                        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                        <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="body" className="block text-sm font-medium text-gray-700">Body</label>
                        <textarea id="body" value={body} onChange={e => setBody(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <button
                        onClick={handleSendQuote}
                        disabled={isSending}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-colors disabled:bg-gray-400"
                    >
                        {isSending ? 'Sending...' : 'Send Quote'}
                    </button>
                </div>
                
                <div>
                     <h4 className="text-lg font-semibold mb-2">Quote Preview</h4>
                     <div className="border rounded-lg p-4 overflow-auto max-h-[600px] bg-white">
                         <div ref={quoteRef}>
                           <QuoteSummary jobDetails={jobDetails} dealResponses={dealResponses} onNext={dummyFunc} onBack={dummyFunc} />
                         </div>
                     </div>
                </div>
            </div>

            <div className="flex justify-between mt-8">
                <button onClick={onBack} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Back to Summary</button>
                <button onClick={onReset} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">Start New Quote</button>
            </div>
        </div>
    );
};
