
import React, { useState } from 'react';

interface BusinessInputFormProps {
    onSearch: (businessName: string, city: string) => void;
    isLoading: boolean;
}

const BusinessInputForm: React.FC<BusinessInputFormProps> = ({ onSearch, isLoading }) => {
    const [businessName, setBusinessName] = useState('');
    const [city, setCity] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = businessName.trim();
        const trimmedCity = city.trim();

        if (!trimmedName || !trimmedCity) {
            return;
        }

        if (trimmedName.length < 2) {
            alert('El nombre del negocio debe tener al menos 2 caracteres');
            return;
        }

        if (trimmedCity.length < 2) {
            alert('La ciudad debe tener al menos 2 caracteres');
            return;
        }

        onSearch(trimmedName, trimmedCity);
    };

    return (
        <div className="animate-fade-in w-full max-w-xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-12">
                <div className="space-y-10">
                    <div className="group">
                        <label className="mono-label text-[10px] mb-3 block text-neutral-400 group-focus-within:text-black transition-colors tracking-[0.2em]">
                            TARGET_ENTITY
                        </label>
                        <input
                            type="text"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            placeholder="NOMBRE DEL NEGOCIO O GRUPO"
                            required
                            className="w-full border-b border-neutral-200 focus:border-black transition-all px-0 py-2 text-2xl font-bold uppercase placeholder:text-neutral-100 outline-none bg-transparent"
                        />
                    </div>
                    <div className="group">
                        <label className="mono-label text-[10px] mb-3 block text-neutral-400 group-focus-within:text-black transition-colors tracking-[0.2em]">
                            LOCATION_SCOPE
                        </label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="CIUDAD O REGIÓN"
                            required
                            className="w-full border-b border-neutral-200 focus:border-black transition-all px-0 py-2 text-2xl font-bold uppercase placeholder:text-neutral-100 outline-none bg-transparent"
                        />
                    </div>
                </div>
                
                <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full border border-black bg-white py-6 hover:bg-black transition-all duration-500"
                >
                    <div className="relative z-10 flex items-center justify-center gap-4">
                        <span className="font-extrabold text-[11px] uppercase tracking-[0.3em] group-hover:text-white transition-colors">
                            {isLoading ? 'ANALYZING_CFO_DATA' : 'IDENTIFICAR CFO'}
                        </span>
                        {!isLoading && <span className="material-symbols-outlined text-[18px] group-hover:text-white group-hover:animate-pulse">radar</span>}
                    </div>
                </button>

                <div className="flex justify-between items-center opacity-20 px-1">
                    <span className="mono-label text-[7px]">OSINT_ENGINE_B2B_V5</span>
                    <span className="mono-label text-[7px]">HONEI_INTEL_SYSTEM</span>
                </div>
            </form>
        </div>
    );
};

export default BusinessInputForm;
