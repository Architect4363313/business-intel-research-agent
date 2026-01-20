
import React, { useState, useEffect } from 'react';

const loadingMessages = [
    "INITIALIZING_OSINT_MODULES",
    "SCRAPING_FINANCIAL_DIRECTORIES",
    "ANALYZING_TPV_ARCHITECTURE",
    "LOCATING_FINANCIAL_DECISION_MAKERS",
    "CALCULATING_ROI_MATCH_PROJECTION",
    "GENERATING_STRATEGIC_DOSSIER"
];

const LoadingIndicator: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const msgInterval = setInterval(() => {
            setMessageIndex(prev => (prev + 1) % loadingMessages.length);
        }, 2000);
        
        const progInterval = setInterval(() => {
            setProgress(prev => Math.min(prev + Math.random() * 5, 95));
        }, 300);

        return () => {
            clearInterval(msgInterval);
            clearInterval(progInterval);
        };
    }, []);

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 animate-fade-in">
            <div className="w-full max-w-md space-y-8">
                <div className="flex justify-between items-end mb-2">
                    <span className="mono-label text-accent font-bold">{loadingMessages[messageIndex]}</span>
                    <span className="mono-label">{Math.floor(progress)}%</span>
                </div>
                <div className="h-4 w-full border-2 border-black p-1">
                    <div 
                        className="h-full bg-black transition-all duration-300" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <div className="flex flex-col gap-1">
                    <p className="mono-label text-[8px] opacity-40">SYSTEM STATUS: ANALYZING PUBLIC SOURCES</p>
                    <p className="mono-label text-[8px] opacity-40">THINKING_BUDGET: 15000ms</p>
                </div>
            </div>
        </div>
    );
};

export default LoadingIndicator;
