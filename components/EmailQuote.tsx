import React, { useState, useRef } from 'react';
import { QuoteSummary } from './QuoteSummary';
import type { JobDetails, DealResponse, Deal, Tip } from '../types';
import type { PRICING as PricingType } from '../constants';
import { Icon } from './common/Icon';

declare const jspdf: any;
declare const html2canvas: any;

interface EmailQuoteProps {
    jobDetails: JobDetails;
    dealResponses: DealResponse[];
    pricing: typeof PricingType;
    deals: Deal[];
    tips: Tip[];
    onBack: () => void;
    onReset: () => void;
}

export const EmailQuote: React.FC<EmailQuoteProps> = ({ jobDetails, dealResponses, pricing, deals, tips, onBack, onReset }) => {
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('Your Carpet Cleaning Quote');
    const [body, setBody] = useState('Please find your detailed quote attached.');
    const [isProcessing, setIsProcessing] = useState(false);
    const quoteRef = useRef<HTMLDivElement>(null);

    const generatePdf = async () => {
        if (!quoteRef.current) return null;
        const canvas = await html2canvas(quoteRef.current, { scale: 2 });
        const { jsPDF } = jspdf;
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
        return pdf;
    };

    const handleDownloadPdf = async () => {
        setIsProcessing(true);
        try {
            const pdf = await generatePdf();
            if (pdf) {
                pdf.save('quote.pdf');
            }
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            alert("Sorry, there was an error generating the PDF.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleEmailQuote = async () => {
        if (!email) {
            alert("Please enter a customer email address.");
            return;
        }
        setIsProcessing(true);
        try {
            const pdf = await generatePdf();
            if (pdf) {
                pdf.save('quote.pdf');
                const emailBody = `${body}\n\nPlease attach the 'quote.pdf' file that has just been downloaded to your device.`;
                const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
                window.location.href = mailtoLink;
            }
        } catch (error) {
            console.error("Failed to generate PDF for email:", error);
            alert("Sorry, there was an error preparing the email.");
        } finally {
            setIsProcessing(false);
        }
    };
    
    const dummyFunc = () => {};

    return (
        <div className="space-y-8">
            <h3 className="text-2xl font-bold text-gray-800">Finalize & Download Quote</h3>
            <p className="text-gray-600">
                You can download a PDF of the quote directly or open your default email client to send it to the customer.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Email Details (Optional)</h4>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Customer Email</label>
                        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="customer@example.com" />
                    </div>
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                        <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="body" className="block text-sm font-medium text-gray-700">Body</label>
                        <textarea id="body" value={body} onChange={e => setBody(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <button
                            onClick={handleDownloadPdf}
                            disabled={isProcessing}
                            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? 'Generating...' : 'Download Quote PDF'}
                        </button>
                        <button
                            onClick={handleEmailQuote}
                            disabled={isProcessing}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                             {isProcessing ? 'Preparing...' : 'Open in Email Client'}
                        </button>
                    </div>
                </div>
                
                <div>
                     <h4 className="text-lg font-semibold mb-2">Quote Preview for PDF</h4>
                     <div className="border rounded-lg p-4 overflow-auto max-h-[600px] bg-white shadow-inner">
                         <div ref={quoteRef}>
                           <QuoteSummary 
                                jobDetails={jobDetails} 
                                dealResponses={dealResponses} 
                                pricing={pricing}
                                deals={deals}
                                tips={tips}
                                onNext={dummyFunc} 
                                onBack={dummyFunc} 
                                isPreview={true}
                            />
                         </div>
                     </div>
                </div>
            </div>

            <div className="flex justify-between mt-8">
                <button onClick={onBack} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Back to Summary</button>
                <button onClick={onReset} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">Start New Quote</button>
            </div>
        </div>
    );
};