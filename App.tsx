
import React, { useState, useEffect } from 'react';
import { fetchBusinessProfile } from './services/geminiService';
import type { BusinessProfile } from './types';
import BusinessInputForm from './components/BusinessInputForm';
import LoadingIndicator from './components/LoadingIndicator';
import ResultsDisplay from './components/ResultsDisplay';
import HistoryList from './components/HistoryList';

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
    const [history, setHistory] = useState<BusinessProfile[]>([]);
    const [view, setView] = useState<'form' | 'results' | 'history'>('form');

    useEffect(() => {
        const savedHistory = localStorage.getItem('hap_audit_history');
        if (savedHistory) {
            try { setHistory(JSON.parse(savedHistory)); } catch (e) { console.error(e); }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('hap_audit_history', JSON.stringify(history));
    }, [history]);

    const handleSearch = async (name: string, location: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const profile = await fetchBusinessProfile(name, location);
            setBusinessProfile(profile);
            setHistory(prev => {
                const filtered = prev.filter(p => !(p.businessName === profile.businessName && p.city === profile.city));
                return [profile, ...filtered].slice(0, 20);
            });
            setView('results');
        } catch (e: any) {
            setError(e.message || 'Error en la investigación OSINT.');
            setView('form');
        } finally {
            setIsLoading(false);
        }
    };

    // Estilo para el fondo degradado artístico (Nexus Aesthetic)
    const backgroundStyle = {
        backgroundImage: `
            radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%),
            radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%),
            radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%),
            radial-gradient(at 100% 100%, hsla(221,45%,30%,1) 0, transparent 50%),
            radial-gradient(at 0% 100%, hsla(242,36%,30%,1) 0, transparent 50%),
            url("https://www.transparenttextures.com/patterns/stardust.png")
        `,
        backgroundSize: 'cover',
        backgroundColor: '#0a0a0c'
    };

    // Variante clara para cuando hay resultados (opcional, pero mantendremos la coherencia)
    const mainBgClass = view === 'form' || isLoading ? "" : "bg-white";

    return (
        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Izquierda */}
            <aside className="w-64 flex flex-col border-r structural-line shrink-0 z-20 bg-white">
                <div className="h-14 flex items-center px-6 border-b structural-line">
                    <div className="flex items-center gap-2">
                        <div className="size-6 bg-black flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-[16px]">terminal</span>
                        </div>
                        <span className="font-extrabold text-sm tracking-tighter uppercase">HAP Intel</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto py-8 px-4 flex flex-col gap-8">
                    <div className="space-y-1">
                        <span className="mono-label px-2 mb-2 block text-[9px]">Scope</span>
                        <button 
                            onClick={() => setView('form')}
                            className={`flex w-full items-center gap-3 px-2 py-2 text-sm font-semibold transition-colors ${view === 'form' ? 'text-black bg-neutral-surface' : 'text-neutral-500 hover:text-black hover:bg-neutral-surface'}`}
                        >
                            <span className="material-symbols-outlined text-[18px]">explore</span>
                            <span>Target Search</span>
                        </button>
                        <button 
                            onClick={() => setView('history')}
                            className={`flex w-full items-center gap-3 px-2 py-2 text-sm font-semibold transition-colors ${view === 'history' ? 'text-black bg-neutral-surface' : 'text-neutral-500 hover:text-black hover:bg-neutral-surface'}`}
                        >
                            <span className="material-symbols-outlined text-[18px]">history</span>
                            <span>Audit Log</span>
                        </button>
                    </div>
                    <div>
                        <span className="mono-label px-2 mb-2 block text-[9px]">Recent Targets</span>
                        <div className="space-y-1">
                            {history.slice(0, 8).map((p, i) => (
                                <button 
                                    key={i}
                                    onClick={() => { setBusinessProfile(p); setView('results'); }}
                                    className="w-full text-left px-2 py-1.5 text-xs font-medium text-neutral-400 hover:text-black hover:bg-neutral-surface truncate rounded-sm uppercase tracking-tighter"
                                >
                                    {p.businessName}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t structural-line">
                    <div className="flex w-full items-center gap-3 p-2">
                        <div className="size-6 bg-black flex items-center justify-center text-[10px] text-white font-bold rounded-sm">
                            {(import.meta.env.VITE_USER_NAME || 'USER')[0]}
                        </div>
                        <span className="text-xs font-bold truncate">{import.meta.env.VITE_USER_NAME || 'ANALYST'}</span>
                    </div>
                </div>
            </aside>

            {/* Contenido Principal */}
            <main className={`flex-1 flex flex-col min-w-0 overflow-hidden relative ${mainBgClass}`}>
                <header className="h-14 flex items-center justify-between px-8 border-b structural-line bg-white/90 backdrop-blur shrink-0 z-30">
                    <div className="flex items-center gap-4">
                        <span className="mono-label text-[9px]">Nexus / Intelligence</span>
                        <div className="h-4 w-px bg-neutral-200"></div>
                        <h1 className="text-sm font-bold truncate uppercase tracking-tight">
                            {view === 'results' && businessProfile ? businessProfile.businessName : 'Command Center'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="mono-label text-[9px] text-neutral-400">
                            {view === 'results' && businessProfile ? 'Ready' : 'Standby'}
                        </span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto relative">
                    {/* Fondo decorativo solo para el formulario y carga */}
                    {(view === 'form' || isLoading) && (
                        <div className="absolute inset-0 z-0" style={backgroundStyle}></div>
                    )}

                    <div className="relative z-10 h-full">
                        {view === 'form' && !isLoading && (
                            <div className="h-full flex items-center justify-center p-8">
                                <div className="w-full max-w-xl bg-white p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/10">
                                    <BusinessInputForm onSearch={handleSearch} isLoading={isLoading} />
                                    {error && (
                                        <div className="mt-12 p-6 border border-black bg-white text-black font-mono text-[10px] tracking-widest uppercase">
                                            [LOG_FAILURE]: {error}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {isLoading && (
                            <div className="h-full bg-black/40 backdrop-blur-sm">
                                <LoadingIndicator />
                            </div>
                        )}

                        {view === 'results' && businessProfile && !isLoading && (
                            <ResultsDisplay profile={businessProfile} onNewSearch={() => setView('form')} />
                        )}

                        {view === 'history' && (
                            <div className="max-w-4xl mx-auto py-12 px-8 bg-white">
                                <HistoryList 
                                    items={history} 
                                    onSelect={(p) => { setBusinessProfile(p); setView('results'); }} 
                                    onDelete={(i) => setHistory(prev => prev.filter((_, idx) => idx !== i))}
                                    onBack={() => setView('form')}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Sidebar Derecha - Verificación de Fuentes */}
            <aside className="w-72 border-l structural-line hidden xl:flex flex-col bg-neutral-surface">
                <div className="h-14 flex items-center px-6 border-b structural-line bg-white">
                    <span className="mono-label text-[9px]">Verified_Evidence</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {businessProfile?.googleSearchSources?.length ? (
                        businessProfile.googleSearchSources.map((source, i) => (
                            <div key={i} className="space-y-1">
                                <div className="flex justify-between items-end">
                                    <span className="mono-label text-black font-bold text-[7px]">Ref_{String(i + 1).padStart(2, '0')}</span>
                                    <span className="mono-label text-[7px] opacity-40">OSINT</span>
                                </div>
                                <div className="flat-card p-2.5 bg-white border border-neutral-100 shadow-sm">
                                    <h4 className="text-[8.5px] font-extrabold uppercase mb-1 truncate leading-tight">{source.title}</h4>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="mono-label text-[6px] bg-neutral-100 px-1 truncate max-w-[100px]">{new URL(source.uri).hostname}</span>
                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-black text-[7px] font-black uppercase hover:underline">View</a>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 gap-3">
                            <span className="material-symbols-outlined text-neutral-200 text-3xl">database</span>
                            <p className="mono-label opacity-40 text-[8px]">Awaiting Scan</p>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t structural-line bg-white">
                    <div className="text-center">
                        <span className="mono-label text-[7px] text-neutral-400">
                            {businessProfile?.googleSearchSources?.length || 0} Sources
                        </span>
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default App;
