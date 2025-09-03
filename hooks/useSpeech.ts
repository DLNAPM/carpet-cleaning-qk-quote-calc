import { useState, useRef, useEffect, useCallback } from 'react';

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

export const useSpeech = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-US';
                
                recognition.onresult = (event) => {
                    let finalTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        }
                    }
                    if (finalTranscript) {
                         setTranscript(prev => prev + finalTranscript);
                    }
                };

                recognition.onend = () => {
                    setIsListening(false);
                };
                
                recognitionRef.current = recognition;
            }
        }

        return () => {
            recognitionRef.current?.stop();
        };
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            recognitionRef.current.start();
            setIsListening(true);
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    const speak = useCallback((text: string) => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            
            const speakNow = () => {
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utterance);
            };

            // Voices may not be loaded initially. If they are, speak immediately.
            // Otherwise, wait for the voices to be loaded.
            if (window.speechSynthesis.getVoices().length > 0) {
                speakNow();
            } else {
                window.speechSynthesis.onvoiceschanged = () => {
                    speakNow();
                    // Clean up the handler to prevent it from being called again.
                    window.speechSynthesis.onvoiceschanged = null;
                };
            }
        }
    }, []);

    return { isListening, transcript, startListening, stopListening, speak, setTranscript };
};