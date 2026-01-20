
import React, { useState } from 'react';
import type { BusinessProfile } from '../types';

const ResultsDisplay: React.FC<{ profile: BusinessProfile, onNewSearch: () => void; }> = ({ profile, onNewSearch }) => {
    const [emailCopied, setEmailCopied] = useState<{ [key: string]: boolean }>({});
    
    const strategicContacts = profile.strategicContacts || [];
    const suggestedEmails = profile.suggestedEmails || [];
    const socialMedia = profile.socialMedia || [];
    
    const financialContact = strategicContacts.find(c => c.area === 'Finanzas') || strategicContacts[0];
    const ownerName = financialContact ? financialContact.name.split(' ')[0] : "Propiedad";
    
    const honeiUrl = "https://www.honei.app/servicios/honei-terminal";
    const emailSubject = `Optimización de cobros y TPV - Honei`;
    
    const senderName = import.meta.env.VITE_USER_NAME || 'el equipo de Honei';
    const emailBodyPlain = `Hola ${ownerName},

Soy ${senderName}, de Honei (${honeiUrl}). He seguido vuestra trayectoria y me gustaría comentaros cómo estamos ayudando a otros grupos similares a optimizar su operativa de cobro.

Trabajo con directivos financieros ayudándoles a eliminar descuadres de caja y reducir costes bancarios mediante la integración total del datáfono con el TPV (Honei Terminal).

Para vuestra operativa actual, ¿os ayudaría automatizar el cierre de mesas y el enrutamiento inteligente multibanco para ahorrar en comisiones?

Normalmente vemos un ahorro de hasta 250€/mes y unas 3 horas diarias de gestión operativa en sala.

Si te parece interesante, ¿podríamos hablar 10 minutos esta semana?

Un saludo,`;

    const copyToClipboard = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setEmailCopied(prev => ({ ...prev, [id]: true }));
            setTimeout(() => setEmailCopied(prev => ({ ...prev, [id]: false })), 2000);
        } catch (err) {
            console.error('Error al copiar:', err);
        }
    };

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${profile.directContacts?.email || (suggestedEmails[0]?.email || '')}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBodyPlain)}`;

    // Generación dinámica del enlace de Perplexity
    const perplexityPrompt = `Actúa como analista de inteligencia comercial B2B. Necesito identificar al Director/a Financiero/a (CFO) de la empresa de hostelería en España: ${profile.businessName} (si es un grupo, incluye filiales y marca comercial).

Devuélveme Nombre y apellidos, cargo exacto, empresa/filial, ciudad, y periodo (año inicio–fin si aparece).

Aporta evidencia: incluye 3–6 enlaces y cita textualmente (frase corta) la parte que lo confirma. Prioriza:
1. Web corporativa (equipo directivo, notas de prensa, memoria/informe anual).
2. LinkedIn (perfil personal + página de empresa).
3. BORME / registros mercantiles / comunicados oficiales si aplica.

Si no hay una confirmación única, propone un top 3 de candidatos (con probabilidad alta/media/baja) y explica en 1 línea por qué. Si la empresa es privada, identifica el rol equivalente (Director de Administración y Finanzas, Finance Director, Head of Finance, Controller corporativo).

Al final, sugiere 5 consultas booleanas para seguir investigando en Google (incluye site:linkedin.com, site:empresa.com, filetype:pdf, y “nombrado”, “incorporación”, “CFO”).

Datos de búsqueda:
Empresa: ${profile.businessName}
Ubicación: ${profile.city}`;

    const perplexityUrl = `https://www.perplexity.ai/search?q=${encodeURIComponent(perplexityPrompt)}`;

    return (
        <div className="px-6 py-10 space-y-12 animate-fade-in max-w-5xl mx-auto overflow-x-hidden">
            {/* SECCIÓN 1: VALORACIÓN DEL SERVICIO (ROI) */}
            <div className="flex gap-8 items-baseline">
                <div className="w-10 shrink-0">
                    <span className="mono-label text-accent font-bold text-[8px] leading-none">SCORE</span>
                </div>
                <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flat-card p-4 border border-neutral-100 shadow-sm">
                            <span className="mono-label text-[7px] mb-2 block text-accent font-bold">VALORACIÓN HONEI</span>
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-2xl font-extrabold tracking-tighter">{profile.honeiAnalysis?.fitScore || 0}%</h2>
                                <span className="text-[8px] font-black uppercase text-green-600">[{profile.honeiAnalysis?.fitLabel || 'PENDIENTE'}]</span>
                            </div>
                            <div className="mt-3 h-0.5 bg-neutral-100 relative">
                                <div className="absolute inset-0 bg-accent h-full transition-all duration-1000" style={{ width: `${profile.honeiAnalysis?.fitScore || 0}%` }}></div>
                            </div>
                        </div>
                        <div className="flat-card p-4 border border-neutral-100 shadow-sm">
                            <span className="mono-label text-[7px] mb-2 block text-accent font-bold">POTENCIAL AHORRO</span>
                            <div className="flex items-baseline gap-1">
                                <h2 className="text-2xl font-extrabold tracking-tighter">~250€</h2>
                                <span className="text-[8px] font-bold text-neutral-400 uppercase">/Mes</span>
                            </div>
                            <div className="mt-3 text-[10px] text-neutral-500 italic font-medium">
                                Enrutamiento inteligente multibanco.
                            </div>
                        </div>
                        <div className="flat-card p-4 border border-neutral-100 shadow-sm">
                            <span className="mono-label text-[7px] mb-2 block text-accent font-bold">PUNTOS CLAVE</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {(profile.honeiAnalysis?.matchedFeatures || ['TPV Integrado', 'Eficiencia']).slice(0, 3).map((f, i) => (
                                    <span key={i} className="text-[7px] font-bold border border-neutral-200 px-1.5 py-0.5 uppercase bg-neutral-50">{f}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: DECISION MAKERS */}
            <div className="flex gap-8 items-baseline">
                <div className="w-10 shrink-0">
                    <span className="mono-label text-accent font-bold text-[8px] leading-none">PROPS</span>
                </div>
                <div className="flex-1 space-y-4">
                    <span className="mono-label text-accent font-bold text-[8px] leading-none block">Identified Decision Makers</span>
                    <div className="border border-neutral-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left text-[10px]">
                            <thead className="bg-neutral-50 text-neutral-600 uppercase text-[7px] font-bold tracking-[0.1em] border-b border-neutral-200">
                                <tr>
                                    <th className="px-4 py-2 border-r border-neutral-100">Nombre Completo</th>
                                    <th className="px-4 py-2 border-r border-neutral-100">Cargo / Responsabilidad</th>
                                    <th className="px-4 py-2 text-center">Validación</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {strategicContacts.length > 0 ? strategicContacts.map((contact, i) => (
                                    <tr key={i} className="hover:bg-neutral-50/50">
                                        <td className="px-4 py-3 font-extrabold uppercase tracking-tight text-[10px]">{contact.name}</td>
                                        <td className="px-4 py-3 border-r text-neutral-500 uppercase text-[9px]">{contact.role}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-sm ${contact.confidence === 'Alto' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                                {contact.confidence}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-6 text-center text-neutral-400 italic">No se han identificado directivos en esta búsqueda.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* NUEVA SECCIÓN: PERPLEXITY SCAN */}
            <div className="flex gap-8 items-baseline">
                <div className="w-10 shrink-0">
                    <span className="mono-label text-accent font-bold text-[8px] leading-none">DEEP</span>
                </div>
                <div className="flex-1 space-y-4">
                    <span className="mono-label text-accent font-bold text-[8px] leading-none block">Perplexity Deep Analysis Protocol</span>
                    <div className="border border-neutral-200 p-6 bg-neutral-50/30 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h3 className="text-[11px] font-black uppercase tracking-tight text-neutral-800">Investigación Exhaustiva de CFO</h3>
                            <p className="text-[9px] text-neutral-500 leading-relaxed max-w-lg">
                                Si el motor Gemini no ha encontrado al CFO, inicia este protocolo de búsqueda profunda en Perplexity. El prompt maestro incluye búsquedas en BORME, LinkedIn y Webs Corporativas con verificación de 6 fuentes.
                            </p>
                        </div>
                        <a 
                            href={perplexityUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 flex items-center gap-3 bg-white border-2 border-black px-6 py-3 hover:bg-black hover:text-white transition-all group"
                        >
                            <span className="material-symbols-outlined text-[18px]">travel_explore</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ejecutar Perplexity</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 3: EMAILS */}
            <div className="flex gap-8 items-baseline">
                <div className="w-10 shrink-0">
                    <span className="mono-label text-accent font-bold text-[8px] leading-none">MAIL</span>
                </div>
                <div className="flex-1 space-y-4">
                    <span className="mono-label text-accent font-bold text-[8px] leading-none block">Contact Vectors & Email Patterns</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-neutral-200 bg-white shadow-sm">
                            <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-200 flex justify-between">
                                <span className="mono-label text-[7px] font-bold">Verified / Suggested Emails</span>
                                <span className="mono-label text-[7px]">Pattern analysis</span>
                            </div>
                            <div className="divide-y divide-neutral-100">
                                {suggestedEmails.length > 0 ? suggestedEmails.map((email, i) => (
                                    <div key={i} className="px-4 py-2.5 flex items-center justify-between group">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-mono font-bold text-accent">{email.email}</span>
                                            <span className="text-[7px] text-neutral-400 uppercase tracking-tighter">{email.status} • {email.bounceRisk} Risk</span>
                                        </div>
                                        <button 
                                            onClick={() => copyToClipboard(email.email, `mail-${i}`)}
                                            className="p-1.5 text-neutral-300 hover:text-black hover:bg-neutral-50 transition-all rounded"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">{emailCopied[`mail-${i}`] ? 'check' : 'content_copy'}</span>
                                        </button>
                                    </div>
                                )) : (
                                    <div className="px-4 py-4 text-[9px] text-neutral-400 italic">No emails detected.</div>
                                )}
                            </div>
                        </div>
                        <div className="border border-neutral-200 p-4 bg-neutral-50/30 shadow-sm">
                            <span className="mono-label text-[7px] mb-3 block opacity-60">Dominio Detectado</span>
                            <div className="text-[11px] font-mono font-bold border-b border-neutral-200 pb-2 mb-4">
                                {profile.emailDomain || 'No identificado'}
                            </div>
                            <span className="mono-label text-[7px] mb-2 block opacity-60">Notas OSINT de Contacto</span>
                            <p className="text-[9px] text-neutral-500 leading-relaxed italic">
                                {profile.osintNotes?.unverified || "Verificar mediante llamadas frías si el patrón {nombre}.{apellido} es válido para este dominio."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 4: DRAFT */}
            <div className="flex gap-8 items-baseline">
                <div className="w-10 shrink-0">
                    <span className="mono-label text-accent font-bold text-[8px] leading-none">DRAFT</span>
                </div>
                <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="mono-label text-accent font-bold text-[8px] leading-none">Honei Terminal Outreach</span>
                        <div className="flex gap-2">
                             <button 
                                onClick={() => copyToClipboard(emailBodyPlain, 'draft')}
                                className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest border border-neutral-200 px-3 py-1.5 hover:bg-black hover:text-white transition-all shadow-sm"
                            >
                                <span className="material-symbols-outlined text-[12px]">{emailCopied['draft'] ? 'done' : 'content_copy'}</span>
                                {emailCopied['draft'] ? 'Copied' : 'Copy Body'}
                            </button>
                            <a 
                                href={gmailUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest bg-black text-white px-4 py-1.5 hover:bg-accent transition-all shadow-sm"
                            >
                                <span className="material-symbols-outlined text-[12px]">send</span>
                                Open Gmail
                            </a>
                        </div>
                    </div>
                    <div className="border border-neutral-200 p-6 bg-neutral-50/50 shadow-sm">
                        <div className="font-mono text-[10px] leading-relaxed text-neutral-700 whitespace-pre-wrap max-h-48 overflow-y-auto pr-4">
                            {emailBodyPlain}
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 5: PRESENCIA */}
            <div className="flex gap-8 items-baseline">
                <div className="w-10 shrink-0">
                    <span className="mono-label text-accent font-bold text-[8px] leading-none">PRES</span>
                </div>
                <div className="flex-1 space-y-4">
                    <span className="mono-label text-accent font-bold text-[8px] leading-none block">Digital Presence & Social Profiles</span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <a 
                            href={profile.googleSearchSources?.[0]?.uri || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flat-card p-3 border border-neutral-100 flex items-center justify-between group shadow-sm"
                        >
                            <div className="flex flex-col truncate">
                                <span className="text-[7px] font-bold text-neutral-400 uppercase">Website</span>
                                <span className="text-[9px] font-bold truncate">Web Corporativa</span>
                            </div>
                            <span className="material-symbols-outlined text-[14px] text-neutral-300 group-hover:text-black">open_in_new</span>
                        </a>
                        {socialMedia.length > 0 ? socialMedia.map((social, i) => (
                            <a 
                                key={i}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flat-card p-3 border border-neutral-100 flex items-center justify-between group shadow-sm"
                            >
                                <div className="flex flex-col truncate">
                                    <span className="text-[7px] font-bold text-neutral-400 uppercase">{social.platform}</span>
                                    <span className="text-[9px] font-bold truncate">{social.handle || 'Visit Profile'}</span>
                                </div>
                                <span className="material-symbols-outlined text-[14px] text-neutral-300 group-hover:text-black">link</span>
                            </a>
                        )) : (
                            ['LinkedIn', 'Instagram', 'Maps'].map((platform, i) => (
                                <div key={i} className="flat-card p-3 border border-neutral-100 bg-neutral-50/50 opacity-50 flex items-center justify-between shadow-sm">
                                    <div className="flex flex-col">
                                        <span className="text-[7px] font-bold text-neutral-400 uppercase">{platform}</span>
                                        <span className="text-[9px] font-bold">Not Linked</span>
                                    </div>
                                    <span className="material-symbols-outlined text-[14px] text-neutral-200">link_off</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-12 flex justify-center border-t border-neutral-100">
                <button 
                    onClick={onNewSearch}
                    className="group flex items-center gap-4 text-[8px] font-black uppercase tracking-[0.3em] text-neutral-400 hover:text-black transition-all duration-300"
                >
                    <span className="material-symbols-outlined text-[14px] group-hover:rotate-180 transition-transform duration-700">refresh</span>
                    RELOAD_SYSTEM_FOR_NEW_TARGET
                </button>
            </div>
            <div className="h-20"></div>
        </div>
    );
};

export default ResultsDisplay;
