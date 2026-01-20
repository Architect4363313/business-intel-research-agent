
import React from 'react';
import type { BusinessProfile } from '../types';

interface HistoryListProps {
    items: BusinessProfile[];
    onSelect: (profile: BusinessProfile) => void;
    onDelete: (index: number) => void;
    onBack: () => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ items, onSelect, onDelete, onBack }) => {
    if (items.length === 0) {
        return (
            <div className="text-center py-20 animate-fade-in">
                <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-xl font-serif text-stone-900 mb-2">Historial HAP Vacío</h3>
                <p className="text-stone-500 text-sm mb-8">Aún no has generado ninguna auditoría de eficiencia.</p>
                <button 
                    onClick={onBack}
                    className="bg-ultramarine-900 text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black transition-all"
                >
                    Generar Primer Perfil HAP
                </button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-end border-b border-stone-200 pb-6">
                <div>
                    <h2 className="text-3xl font-serif text-stone-900">Historial HAP</h2>
                    <p className="text-stone-500 text-sm">Registro de inteligencia financiera recolectada.</p>
                </div>
                <div className="text-xs font-bold text-ultramarine-400 uppercase tracking-widest">
                    {items.length} Reportes Guardados
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {items.map((item, index) => (
                    <div 
                        key={`${item.businessName}-${item.city}-${index}`}
                        className="group relative bg-white border border-stone-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden"
                    >
                        <div className="absolute left-0 top-0 w-1 h-full bg-ultramarine-900 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="flex-1 space-y-1">
                            <h4 className="text-xl font-serif text-stone-900 group-hover:text-ultramarine-900 transition-colors">{item.businessName}</h4>
                            <div className="flex items-center gap-3 text-sm text-stone-400">
                                <span className="text-ultramarine-600 font-bold">{item.city}</span>
                                <span>•</span>
                                <span>{item.operationalInfo.menuType}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="text-right">
                                <div className="text-2xl font-black text-ultramarine-900">{item.honeiAnalysis.fitScore}%</div>
                                <div className={`text-[10px] font-bold uppercase ${item.honeiAnalysis.fitLabel === 'Muy Alta' ? 'text-emerald-500' : 'text-blue-500'}`}>
                                    ROI {item.honeiAnalysis.fitLabel}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => onSelect(item)}
                                    className="bg-stone-50 hover:bg-ultramarine-900 hover:text-white text-stone-900 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border border-stone-200"
                                >
                                    Ver Reporte
                                </button>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(index);
                                    }}
                                    className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                                    title="Eliminar"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistoryList;
