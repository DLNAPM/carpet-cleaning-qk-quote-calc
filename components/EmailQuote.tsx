import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { QuoteSummary } from './QuoteSummary';
import type { JobDetails, DealResponse } from '../types';

declare const jspdf: any;
declare const html2canvas: any;

// IMPORTANT: Replace with your EmailJS credentials
// 1. Create a free account at https://www.emailjs.com/
// 2. Add a new service (e.g., Gmail).
// 3. Create a new email template. Inside the template, you can use variables like {{to_email}}, {{subject}}, and {{body}}.
// 4. In the template's "Attachments" tab, add an attachment. Use `{{pdf_attachment}}` as the content.
// 5. Find your Service ID, Template ID, and Public Key (under Account > API Keys) and paste them below.
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

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

        if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' || EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID' || EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
            setErrorMessage("EmailJS is not configured. Please add your credentials in the EmailQuote.tsx file.");
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

            const templateParams = {
                to_email: email,
                subject: subject,
                body: body,
                pdf_attachment: pdfBase64,
            };
            
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
            setSendStatus('success');
        } catch (error: any) {
            console.error("Failed to send email:", error);
            setErrorMessage(error?.text || 'An unknown error occurred while sending the email.');
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
                This will generate a PDF of the quote and send it to the customer using a secure email service.
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