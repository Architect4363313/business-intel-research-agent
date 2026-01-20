import React, { useMemo, useState } from 'react';
import type { BusinessProfile } from '../types';

interface HistoryListProps {
    items: BusinessProfile[];
    onSelect: (profile: BusinessProfile) => void;
    onDelete: (index: number) => void;
    onBack: () => void;
    onUpdate: (index: number, updates: Partial<BusinessProfile>) => void;
}

const statusOptions: BusinessProfile['crmStatus'][] = ['Nuevo', 'Cualificado', 'Contactado', 'Respuesta', 'Descartado'];

const HistoryList: React.FC<HistoryListProps> = ({ items, onSelect, onDelete, onBack, onUpdate }) => {
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [cityFilter, setCityFilter] = useState<string>('');

    const filteredItems = useMemo(() => {
        return items
            .map((item, index) => ({ item, index }))
            .filter(({ item }) => {
                const matchesStatus = statusFilter ? item.crmStatus === statusFilter : true;
                const matchesCity = cityFilter ? item.city.toLowerCase().includes(cityFilter.toLowerCase()) : true;
                return matchesStatus && matchesCity;
            });
    }, [items, statusFilter, cityFilter]);

    if (items.length === 0) {
        return (
            <div className="text-center py-20 animate-fade-in">
                <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-xl font-serif text-stone-900 mb-2">Historial HAP vacío</h3>
                <p className="text-stone-500 text-sm mb-8">Aún no has generado ningún perfil de prospección.</p>
                <button 
                    onClick={onBack}
                    className="bg-ultramarine-900 text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black transition-all"
                >
                    Generar primer perfil
                </button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-8 max-w-4xl mx-auto">
            <div className="flex flex-col gap-6 border-b border-stone-200 pb-6">
                <div className="flex flex-wrap justify-between items-end gap-4">
                    <div>
                        <h2 className="text-3xl font-serif text-stone-900">Historial de prospección</h2>
                        <p className="text-stone-500 text-sm">Mini-CRM con contexto y próximas acciones.</p>
                    </div>
                    <div className="text-xs font-bold text-ultramarine-400 uppercase tracking-widest">
                        {items.length} perfiles guardados
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Filtrar por estado</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs font-semibold uppercase"
                        >
                            <option value="">Todos</option>
                            {statusOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Filtrar por ciudad</label>
                        <input
                            value={cityFilter}
                            onChange={(e) => setCityFilter(e.target.value)}
                            placeholder="Ej. Madrid"
                            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs font-semibold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Exportar</label>
                        <button
                            type="button"
                            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs font-semibold uppercase hover:bg-stone-900 hover:text-white transition-colors"
                        >
                            Exportar CSV
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredItems.map(({ item, index }) => (
                    <div 
                        key={`${item.businessName}-${item.city}-${index}`}
                        className="group relative bg-white border border-stone-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-6 overflow-hidden"
                    >
                        <div className="absolute left-0 top-0 w-1 h-full bg-ultramarine-900 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex-1 space-y-1">
                                <h4 className="text-xl font-serif text-stone-900 group-hover:text-ultramarine-900 transition-colors">{item.businessName}</h4>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-stone-400">
                                    <span className="text-ultramarine-600 font-bold">{item.city}</span>
                                    <span>•</span>
                                    <span>{item.operationalInfo?.menuType || 'Tipo no identificado'}</span>
                                    <span>•</span>
                                    <span>{item.estimatedVolume || 'Volumen N/D'}</span>
                                </div>
                                <div className="text-[11px] text-stone-500">
                                    Decisor detectado: {item.strategicContacts?.[0]?.role || 'Pendiente de confirmar'}
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <div className="text-2xl font-black text-ultramarine-900">{item.honeiAnalysis.fitScore}%</div>
                                    <div className={`text-[10px] font-bold uppercase ${item.honeiAnalysis.fitLabel === 'Muy Alta' ? 'text-emerald-500' : 'text-blue-500'}`}>
                                        Match {item.honeiAnalysis.fitLabel}
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => onSelect(item)}
                                        className="bg-stone-50 hover:bg-ultramarine-900 hover:text-white text-stone-900 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border border-stone-200"
                                    >
                                        Ver perfil
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Estado</label>
                                <select
                                    value={item.crmStatus || 'Nuevo'}
                                    onChange={(e) => onUpdate(index, { crmStatus: e.target.value as BusinessProfile['crmStatus'] })}
                                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs font-semibold uppercase"
                                >
                                    {statusOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Próxima acción</label>
                                <input
                                    value={item.nextAction || ''}
                                    onChange={(e) => onUpdate(index, { nextAction: e.target.value })}
                                    placeholder="Ej. Enviar email corto"
                                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs font-semibold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Notas</label>
                                <input
                                    value={item.notes || ''}
                                    onChange={(e) => onUpdate(index, { notes: e.target.value })}
                                    placeholder="Información adicional"
                                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs font-semibold"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistoryList;
