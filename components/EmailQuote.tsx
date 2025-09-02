import React, { useState, useRef } from 'react';
import { QuoteSummary } from './QuoteSummary';
import type { JobDetails, DealResponse } from '../types';

// SECURITY WARNING: Exposing SMTP credentials in client-side code is a significant security risk.
// Anyone can view your website's source code and steal these credentials.
// For production applications, it is strongly recommended to use a backend service
// to handle email sending, keeping your credentials secure on a server.
// This implementation proceeds based on a specific user request but is not a recommended practice.

declare const jspdf: any;
declare const html2canvas: any;
declare const Email: any; // SMTPJS is loaded from a script tag in index.html

interface EmailQuoteProps {
    jobDetails: JobDetails;
    dealResponses: DealResponse[];
    onBack: () => void;
    onReset: () => void;
}

export const EmailQuote: React.FC<EmailQuoteProps> = ({ jobDetails, dealResponses, onBack, onReset }) => {
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('Your Carpet Cleaning Quote');
    const [body, setBody] = useState('Please find your detailed quote attached as a PDF.');
    const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const quoteRef = useRef<HTMLDivElement>(null);

    const handleSendQuote = async () => {
        if (!email) {
            alert("Please enter a customer email address.");
            return;
        }
        if (!quoteRef.current) return;

        if (!process.env.PUBLIC_SMTP_SERVER || !process.env.PUBLIC_SMTP_USERNAME || !process.env.PUBLIC_SMTP_PASSWORD || !process.env.PUBLIC_SMTP_PORT) {
            setErrorMessage("SMTP is not configured. Please ensure PUBLIC_SMTP_SERVER, PUBLIC_SMTP_USERNAME, PUBLIC_SMTP_PASSWORD, and PUBLIC_SMTP_PORT are set as environment variables in your hosting provider.");
            setSendStatus('error');
            return;
        }

        setSendStatus('sending');
        setErrorMessage('');

        try {
            const canvas = await html2canvas(quoteRef.current, { scale: 2 });
            const { jsPDF } = jspdf;
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
            const pdfBase64 = pdf.output('datauristring').split(',')[1];

            await Email.send({
                Host: process.env.PUBLIC_SMTP_SERVER,
                Port: parseInt(process.env.PUBLIC_SMTP_PORT, 10),
                Username: process.env.PUBLIC_SMTP_USERNAME,
                Password: process.env.PUBLIC_SMTP_PASSWORD,
                To: email,
                From: process.env.PUBLIC_SMTP_USERNAME, // Sender email is often the same as the username
                Subject: subject,
                Body: body,
                Attachments: [
                    {
                        name: "quote.pdf",
                        data: pdfBase64,
                    },
                ],
            });

            setSendStatus('success');
        } catch (error: any) {
            console.error("Failed to send email via SMTP:", error);
            setErrorMessage(error.toString() || 'An unknown error occurred while sending the email.');
            setSendStatus('error');
        }
    };
    
    const dummyFunc = () => {};

    const renderSendButtonText = () => {
        switch (sendStatus) {
            case 'sending': return 'Sending...';
            case 'success': return 'Sent Successfully!';
            case 'error': return 'Retry Sending';
            default: return 'Send Quote & Attach PDF';
        }
    };

    return (
        <div className="space-y-8">
            <h3 className="text-2xl font-bold text-gray-800">Email Quote to Customer</h3>
            <p className="text-gray-600">
                This will generate a PDF of the quote and send it to the customer using your configured SMTP service.
            </p>

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
                        disabled={sendStatus === 'sending' || sendStatus === 'success'}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {renderSendButtonText()}
                    </button>
                    {sendStatus === 'success' && <p className="text-green-600 mt-2 text-center font-semibold">Quote sent successfully!</p>}
                    {sendStatus === 'error' && <p className="text-red-600 mt-2 text-center"><strong>Error:</strong> {errorMessage}</p>}
                </div>
                
                <div>
                     <h4 className="text-lg font-semibold mb-2">Quote Preview for PDF</h4>
                     <div className="border rounded-lg p-4 overflow-auto max-h-[600px] bg-white shadow-inner">
                         <div ref={quoteRef}>
                           <QuoteSummary 
                                jobDetails={jobDetails} 
                                dealResponses={dealResponses} 
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
                <button onClick={onReset} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">Start New Quote</button>
            </div>
        </div>
    );
};