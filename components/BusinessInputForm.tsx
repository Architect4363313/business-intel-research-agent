import React, { useMemo, useState } from 'react';

interface SuggestionOption {
    label: string;
    name: string;
    city: string;
}

interface BatchEntry {
    name: string;
    city?: string;
}

interface BusinessInputFormProps {
    onSearch: (businessName: string, city: string) => void;
    onBatchSearch: (entries: BatchEntry[], fallbackCity: string) => void;
    isLoading: boolean;
    recentSuggestions: SuggestionOption[];
    batchProgress?: { current: number; total: number } | null;
}

const BusinessInputForm: React.FC<BusinessInputFormProps> = ({
    onSearch,
    onBatchSearch,
    isLoading,
    recentSuggestions,
    batchProgress
}) => {
    const [inputMode, setInputMode] = useState<'single' | 'list'>('single');
    const [businessName, setBusinessName] = useState('');
    const [city, setCity] = useState('');
    const [batchText, setBatchText] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const filteredSuggestions = useMemo(() => {
        if (!businessName.trim()) return [];
        const query = businessName.toLowerCase();
        return recentSuggestions
            .filter((option) => option.label.toLowerCase().includes(query))
            .slice(0, 5);
    }, [businessName, recentSuggestions]);

    const parseInlineCity = (text: string) => {
        const separators = [',', ' - ', ' — '];
        for (const separator of separators) {
            if (text.includes(separator)) {
                const [namePart, cityPart] = text.split(separator).map(part => part.trim());
                if (namePart && cityPart) {
                    return { name: namePart, city: cityPart };
                }
            }
        }
        return { name: text.trim(), city: '' };
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputMode === 'single') {
            if (!businessName.trim()) return;
            const parsed = parseInlineCity(businessName);
            const resolvedCity = city.trim() || parsed.city || 'España';
            onSearch(parsed.name, resolvedCity);
            return;
        }

        const entries = batchText
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .slice(0, 20)
            .map((line) => parseInlineCity(line));

        if (entries.length === 0) return;
        onBatchSearch(entries, city.trim());
    };

    return (
        <div className="animate-fade-in w-full max-w-xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-10">
                <div className="flex gap-2 bg-neutral-50 border border-neutral-200 p-1 text-[10px] font-bold uppercase tracking-[0.2em]">
                    <button
                        type="button"
                        onClick={() => setInputMode('single')}
                        className={`flex-1 py-2 transition-colors ${inputMode === 'single' ? 'bg-black text-white' : 'text-neutral-400 hover:text-black'}`}
                    >
                        Entrada única
                    </button>
                    <button
                        type="button"
                        onClick={() => setInputMode('list')}
                        className={`flex-1 py-2 transition-colors ${inputMode === 'list' ? 'bg-black text-white' : 'text-neutral-400 hover:text-black'}`}
                    >
                        Modo lista
                    </button>
                </div>

                {inputMode === 'single' ? (
                    <div className="space-y-8">
                        <div className="group relative">
                            <label className="mono-label text-[10px] mb-3 block text-neutral-400 group-focus-within:text-black transition-colors tracking-[0.2em]">
                                URL / NOMBRE DEL NEGOCIO
                            </label>
                            <input
                                type="text"
                                value={businessName}
                                onChange={(e) => {
                                    setBusinessName(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                                onFocus={() => setShowSuggestions(true)}
                                placeholder="Pega una URL, ficha de Google, Instagram o escribe el nombre"
                                required
                                className="w-full border-b border-neutral-200 focus:border-black transition-all px-0 py-2 text-xl font-bold uppercase placeholder:text-neutral-100 outline-none bg-transparent"
                            />
                            {showSuggestions && filteredSuggestions.length > 0 && (
                                <div className="absolute z-20 mt-2 w-full border border-neutral-200 bg-white shadow-lg">
                                    {filteredSuggestions.map((option) => (
                                        <button
                                            type="button"
                                            key={option.label}
                                            onClick={() => {
                                                setBusinessName(option.name);
                                                setCity(option.city);
                                                setShowSuggestions(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-[11px] hover:bg-neutral-50"
                                        >
                                            <span className="font-bold uppercase">{option.name}</span>
                                            <span className="text-neutral-400"> · {option.city}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="group">
                            <label className="mono-label text-[10px] mb-3 block text-neutral-400 group-focus-within:text-black transition-colors tracking-[0.2em]">
                                CIUDAD (OPCIONAL)
                            </label>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="Si no la sabes, la inferimos"
                                className="w-full border-b border-neutral-200 focus:border-black transition-all px-0 py-2 text-xl font-bold uppercase placeholder:text-neutral-100 outline-none bg-transparent"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="group">
                            <label className="mono-label text-[10px] mb-3 block text-neutral-400 group-focus-within:text-black transition-colors tracking-[0.2em]">
                                PEGA HASTA 20 NEGOCIOS (UNO POR LÍNEA)
                            </label>
                            <textarea
                                value={batchText}
                                onChange={(e) => setBatchText(e.target.value)}
                                placeholder="Ejemplo: La Barra Azul, Madrid\nGrupo La Santa, Valencia\nhttps://maps.google.com/..."
                                rows={6}
                                className="w-full border border-neutral-200 focus:border-black transition-all px-4 py-3 text-sm font-semibold uppercase placeholder:text-neutral-200 outline-none bg-transparent"
                            />
                        </div>
                        <div className="group">
                            <label className="mono-label text-[10px] mb-3 block text-neutral-400 group-focus-within:text-black transition-colors tracking-[0.2em]">
                                CIUDAD GENERAL (OPCIONAL)
                            </label>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="Se usa si una línea no indica ciudad"
                                className="w-full border-b border-neutral-200 focus:border-black transition-all px-0 py-2 text-xl font-bold uppercase placeholder:text-neutral-100 outline-none bg-transparent"
                            />
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full border border-black bg-white py-6 hover:bg-black transition-all duration-500"
                >
                    <div className="relative z-10 flex items-center justify-center gap-4">
                        <span className="font-extrabold text-[11px] uppercase tracking-[0.3em] group-hover:text-white transition-colors">
                            {isLoading ? 'Analizando objetivos' : inputMode === 'single' ? 'Analizar negocio' : 'Procesar lista'}
                        </span>
                        {!isLoading && <span className="material-symbols-outlined text-[18px] group-hover:text-white group-hover:animate-pulse">radar</span>}
                    </div>
                </button>

                {batchProgress && (
                    <div className="border border-neutral-200 px-4 py-3 text-[9px] uppercase font-bold tracking-widest text-neutral-500">
                        Procesando lote: {batchProgress.current} / {batchProgress.total}
                    </div>
                )}

                <div className="flex justify-between items-center opacity-20 px-1">
                    <span className="mono-label text-[7px]">OSINT_ENGINE_B2B_V6</span>
                    <span className="mono-label text-[7px]">HONEI_INTEL_SYSTEM</span>
                </div>
            </form>
        </div>
    );
};

export default BusinessInputForm;
