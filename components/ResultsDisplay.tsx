import React, { useMemo, useState } from 'react';
import type { BusinessProfile } from '../types';

const ResultsDisplay: React.FC<{ profile: BusinessProfile; onNewSearch: () => void }> = ({ profile, onNewSearch }) => {
    const [emailCopied, setEmailCopied] = useState<{ [key: string]: boolean }>({});
    const [emailWorkflow, setEmailWorkflow] = useState({ generated: true, opened: false, sent: false });
    const [templateVariant, setTemplateVariant] = useState('Cafetería alta rotación');
    const [abVariant, setAbVariant] = useState<'A' | 'B'>('A');
    const [hasLegalBasis, setHasLegalBasis] = useState(false);

    const strategicContacts = profile.strategicContacts || [];
    const suggestedEmails = profile.suggestedEmails || [];
    const socialMedia = profile.socialMedia || [];

    const financialContact = strategicContacts.find(c => c.area === 'Finanzas') || strategicContacts[0];
    const ownerName = financialContact ? financialContact.name.split(' ')[0] : 'Propiedad';

    const honeiUrl = 'https://www.honei.app/servicios/honei-terminal';
    const emailSubjectPrimary = 'Optimización de cobros y TPV para hostelería';
    const emailSubjectAlt = 'Reducir comisiones y descuadres en caja';

    const emailBodyNormal = `Hola ${ownerName},

Soy David Prado, de Honei (${honeiUrl}). He seguido vuestra trayectoria y me gustaría comentaros cómo estamos ayudando a otros grupos similares a optimizar su operativa de cobro.

Trabajo con directivos financieros eliminando descuadres de caja y reduciendo costes bancarios mediante la integración total del datáfono con el TPV (Honei Terminal).

Para vuestra operativa actual, ¿os ayudaría automatizar el cierre de mesas y el enrutamiento inteligente multibanco para ahorrar en comisiones?

Normalmente vemos un ahorro de hasta 250€/mes y unas 3 horas diarias de gestión operativa en sala.

Si te parece interesante, ¿podríamos hablar 10 minutos esta semana?

Un saludo,`;

    const emailBodyShort = `Hola ${ownerName},

Soy David de Honei. Ayudamos a restaurantes a reducir comisiones y descuadres con un datáfono integrado al TPV. Normalmente ahorran ~250€/mes y 3h/semana en cierres.

¿Te encaja una llamada corta esta semana para ver si aplica en ${profile.businessName}?

Gracias,`;

    const copyToClipboard = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setEmailCopied(prev => ({ ...prev, [id]: true }));
            setTimeout(() => setEmailCopied(prev => ({ ...prev, [id]: false })), 2000);
        } catch (err) {
            console.error('Error al copiar:', err);
        }
    };

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${profile.directContacts?.email || (suggestedEmails[0]?.email || '')}&su=${encodeURIComponent(emailSubjectPrimary)}&body=${encodeURIComponent(emailBodyNormal)}`;

    const painSignals = (profile.painPoints || []).join(' ').toLowerCase();
    const recommendedAngle = painSignals.includes('cola') || painSignals.includes('espera')
        ? 'Velocidad en barra y reducción de esperas'
        : painSignals.includes('caja') || painSignals.includes('descuadre')
            ? 'Cierres automáticos y control de caja'
            : painSignals.includes('propina')
                ? 'Incremento de propinas y control de pagos'
                : 'Ahorro en comisiones y conciliación bancaria';

    const fitScore = profile.honeiAnalysis?.fitScore || 0;
    const nextStepMessage = fitScore < 45
        ? 'No invertir tiempo: prioriza otros leads o envía email ligero.'
        : fitScore < 65
            ? 'Enviar email corto y validar decisor antes de insistir.'
            : 'Priorizar contacto multicanal con propuesta personalizada.';

    const scoreFactors = useMemo(() => {
        const volumeBoost = profile.estimatedVolume?.toLowerCase().includes('alto') ? 15 : profile.estimatedVolume?.toLowerCase().includes('medio') ? 8 : 0;
        const volumeScore = Math.min(100, Math.round(fitScore * 0.7 + volumeBoost));
        const complexityScore = Math.min(100, 50 + (profile.operationalInfo?.paymentMethods?.length || 1) * 10);
        const painScore = Math.min(100, 40 + (profile.painPoints?.length || 0) * 10);
        const digitalScore = Math.min(100, 30 + (profile.techStack?.length || 0) * 12);

        return [
            { label: 'Volumen potencial', value: volumeScore, detail: 'reseñas, precio medio, categoría' },
            { label: 'Complejidad operativa', value: complexityScore, detail: 'locales, terraza, ritmo' },
            { label: 'Probabilidad de dolor', value: painScore, detail: 'colas, cobros, esperas' },
            { label: 'Madurez digital', value: digitalScore, detail: 'web, TPV, RRSS' }
        ];
    }, [fitScore, profile.estimatedVolume, profile.operationalInfo?.paymentMethods, profile.painPoints, profile.techStack]);

    const emailConfidence = (risk: string) => {
        switch (risk) {
            case 'Bajo':
                return 'Alta';
            case 'Medio':
                return 'Media';
            default:
                return 'Baja';
        }
    };

    const possibleGroup = profile.businessName.toLowerCase().includes('grupo') || profile.businessName.toLowerCase().includes('group');

    const perplexityBase = `Empresa: ${profile.businessName}\nUbicación: ${profile.city}`;
    const perplexityObjectives = [
        {
            id: 'decisor',
            label: 'Encontrar decisor',
            prompt: `Actúa como analista B2B. Identifica al decisor de pagos/TPV (CFO, Director/a Financiero/a, COO o Socio gestor). Devuelve nombre, cargo exacto, ciudad, periodo y enlaces con cita textual.\n\n${perplexityBase}`
        },
        {
            id: 'tpv',
            label: 'Detectar TPV actual',
            prompt: `Investiga el TPV o sistema de pagos actual. Devuelve proveedor, evidencias y señales públicas (web, reseñas, ofertas laborales).\n\n${perplexityBase}`
        },
        {
            id: 'dolor',
            label: 'Detectar dolor operativo',
            prompt: `Busca señales de dolor operativo (colas, cobros, caja, esperas, propinas). Devuelve citas y fuentes.\n\n${perplexityBase}`
        },
        {
            id: 'banco',
            label: 'Banco/adquirencia',
            prompt: `Detecta banco adquirente o proveedor de pagos. Prioriza notas de prensa, TPV mostrado y pasarelas.\n\n${perplexityBase}`
        }
    ];

    const insightsForEmail = [
        `Gancho económico: ahorro estimado de ${profile.honeiAnalysis?.fitScore ? '250€/mes' : 'comisiones'} con multibanco.`,
        `Prueba social: grupos similares en ${profile.city || 'tu zona'} con cierres automáticos.`,
        `Dolor probable: ${profile.painPoints?.[0] || 'esperas en barra y cierre de caja manual'}.`
    ];

    return (
        <div className="px-6 py-10 space-y-12 animate-fade-in max-w-5xl mx-auto overflow-x-hidden">
            {/* SECCIÓN 1: SCORING */}
            <div className="flex gap-8 items-baseline">
                <div className="w-10 shrink-0">
                    <span className="mono-label text-accent font-bold text-[8px] leading-none">SCORE</span>
                </div>
                <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flat-card p-4 border border-neutral-100 shadow-sm">
                            <span className="mono-label text-[7px] mb-2 block text-accent font-bold">MATCH HONEI</span>
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-2xl font-extrabold tracking-tighter">{profile.honeiAnalysis?.fitScore || 0}%</h2>
                                <span className="text-[8px] font-black uppercase text-green-600">[{profile.honeiAnalysis?.fitLabel || 'PENDIENTE'}]</span>
                            </div>
                            <div className="mt-3 h-0.5 bg-neutral-100 relative">
                                <div className="absolute inset-0 bg-accent h-full transition-all duration-1000" style={{ width: `${profile.honeiAnalysis?.fitScore || 0}%` }}></div>
                            </div>
                        </div>
                        <div className="flat-card p-4 border border-neutral-100 shadow-sm">
                            <span className="mono-label text-[7px] mb-2 block text-accent font-bold">RECOMENDACIÓN</span>
                            <div className="text-[11px] font-bold text-neutral-800 leading-relaxed">
                                {recommendedAngle}
                            </div>
                            <div className="mt-3 text-[9px] text-neutral-400 uppercase">{nextStepMessage}</div>
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

                    <div className="border border-neutral-200 p-4 bg-neutral-50/40">
                        <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-3">Subfactores explicados</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {scoreFactors.map((factor) => (
                                <div key={factor.label} className="flex items-center gap-4">
                                    <div className="w-24 text-[9px] font-bold uppercase text-neutral-600">{factor.label}</div>
                                    <div className="flex-1">
                                        <div className="h-1.5 bg-neutral-200">
                                            <div className="h-1.5 bg-black" style={{ width: `${factor.value}%` }}></div>
                                        </div>
                                        <div className="text-[8px] text-neutral-400 mt-1">{factor.detail}</div>
                                    </div>
                                    <div className="text-[10px] font-black">{factor.value}%</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: DECISION MAKERS */}
            <div className="flex gap-8 items-baseline">
                <div className="w-10 shrink-0">
                    <span className="mono-label text-accent font-bold text-[8px] leading-none">DEC</span>
                </div>
                <div className="flex-1 space-y-4">
                    <span className="mono-label text-accent font-bold text-[8px] leading-none block">Decisores detectados</span>
                    <div className="border border-neutral-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left text-[10px]">
                            <thead className="bg-neutral-50 text-neutral-600 uppercase text-[7px] font-bold tracking-[0.1em] border-b border-neutral-200">
                                <tr>
                                    <th className="px-4 py-2 border-r border-neutral-100">Nombre</th>
                                    <th className="px-4 py-2 border-r border-neutral-100">Cargo</th>
                                    <th className="px-4 py-2 border-r border-neutral-100">Tipo</th>
                                    <th className="px-4 py-2 border-r border-neutral-100">Confianza</th>
                                    <th className="px-4 py-2">Fuente</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {strategicContacts.length > 0 ? strategicContacts.map((contact, i) => (
                                    <tr key={i} className="hover:bg-neutral-50/50 align-top">
                                        <td className="px-4 py-3 font-extrabold uppercase tracking-tight text-[10px]">{contact.name}</td>
                                        <td className="px-4 py-3 border-r text-neutral-500 uppercase text-[9px]">
                                            <div>{contact.role}</div>
                                            <div className="text-[8px] text-neutral-400 normal-case">{contact.relevance || contact.validity}</div>
                                        </td>
                                        <td className="px-4 py-3 border-r text-[8px] font-bold uppercase text-neutral-500">
                                            {contact.area === 'Propiedad' ? 'Propietario' : contact.area === 'Operaciones' ? 'Operaciones' : contact.area}
                                        </td>
                                        <td className="px-4 py-3 border-r text-center">
                                            <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-sm ${contact.confidence === 'Alto' ? 'bg-green-50 text-green-700' : contact.confidence === 'Medio' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                                                {contact.confidence}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-[8px]">
                                            {contact.source?.startsWith('http') ? (
                                                <a href={contact.source} target="_blank" rel="noopener noreferrer" className="text-black font-bold uppercase hover:underline">Ver fuente</a>
                                            ) : (
                                                <span className="text-neutral-400">{contact.source || 'Sin fuente'}</span>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-6 text-center text-neutral-400 italic">No se han identificado decisores en esta búsqueda.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {possibleGroup && (
                        <div className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">
                            Posible grupo detectado · revisa locales relacionados y dominios compartidos.
                        </div>
                    )}
                </div>
            </div>

            {/* SECCIÓN 3: PERPLEXITY BRIEF */}
            <div className="flex gap-8 items-baseline">
                <div className="w-10 shrink-0">
                    <span className="mono-label text-accent font-bold text-[8px] leading-none">BRIEF</span>
                </div>
                <div className="flex-1 space-y-4">
                    <span className="mono-label text-accent font-bold text-[8px] leading-none block">Brief automático en Perplexity</span>
                    <div className="border border-neutral-200 p-6 bg-neutral-50/30 shadow-sm space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {perplexityObjectives.map((objective) => (
                                <a
                                    key={objective.id}
                                    href={`https://www.perplexity.ai/search?q=${encodeURIComponent(objective.prompt)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between gap-3 bg-white border border-neutral-200 px-4 py-3 hover:border-black transition-all"
                                >
                                    <div>
                                        <div className="text-[9px] uppercase font-black">{objective.label}</div>
                                        <div className="text-[8px] text-neutral-400">Prompt específico</div>
                                    </div>
                                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                </a>
                            ))}
                        </div>
                        <div className="text-[9px] text-neutral-500">
                            Resumen esperado: bullets con fuentes, fecha y nivel de confianza.
                        </div>
                        <div className="border border-neutral-200 p-3 bg-white">
                            <div className="text-[9px] uppercase font-black mb-2">Insights para el email</div>
                            <ul className="text-[9px] text-neutral-500 space-y-1 list-disc pl-4">
                                {insightsForEmail.map((insight) => (
                                    <li key={insight}>{insight}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 4: EMAILS */}
            <div className="flex gap-8 items-baseline">
                <div className="w-10 shrink-0">
                    <span className="mono-label text-accent font-bold text-[8px] leading-none">MAIL</span>
                </div>
                <div className="flex-1 space-y-4">
                    <span className="mono-label text-accent font-bold text-[8px] leading-none block">Emails verificados y patrones</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-neutral-200 bg-white shadow-sm">
                            <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-200 flex justify-between">
                                <span className="mono-label text-[7px] font-bold">Emails sugeridos</span>
                                <span className="mono-label text-[7px]">Confianza / verificación</span>
                            </div>
                            <div className="divide-y divide-neutral-100">
                                {suggestedEmails.length > 0 ? suggestedEmails.map((email, i) => (
                                    <div key={i} className="px-4 py-2.5 flex items-center justify-between group">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-mono font-bold text-accent">{email.email}</span>
                                            <span className="text-[7px] text-neutral-400 uppercase tracking-tighter">{email.status} • Riesgo {email.bounceRisk}</span>
                                            <span className="text-[7px] text-neutral-400 uppercase tracking-tighter">Confianza {emailConfidence(email.bounceRisk)} • MX/SMTP pendiente</span>
                                        </div>
                                        <button 
                                            onClick={() => copyToClipboard(email.email, `mail-${i}`)}
                                            className="p-1.5 text-neutral-300 hover:text-black hover:bg-neutral-50 transition-all rounded"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">{emailCopied[`mail-${i}`] ? 'check' : 'content_copy'}</span>
                                        </button>
                                    </div>
                                )) : (
                                    <div className="px-4 py-4 text-[9px] text-neutral-400 italic">No se han detectado emails.</div>
                                )}
                            </div>
                        </div>
                        <div className="border border-neutral-200 p-4 bg-neutral-50/30 shadow-sm">
                            <span className="mono-label text-[7px] mb-3 block opacity-60">Dominio detectado</span>
                            <div className="text-[11px] font-mono font-bold border-b border-neutral-200 pb-2 mb-4">
                                {profile.emailDomain || 'No identificado'}
                            </div>
                            <span className="mono-label text-[7px] mb-2 block opacity-60">Patrones recomendados</span>
                            <p className="text-[9px] text-neutral-500 leading-relaxed italic">
                                {profile.osintNotes?.unverified || 'Probar patrones {nombre}.{apellido} y {inicial}{apellido} y validar con MX/SMTP.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 5: DRAFT */}
            <div className="flex gap-8 items-baseline">
                <div className="w-10 shrink-0">
                    <span className="mono-label text-accent font-bold text-[8px] leading-none">DRAFT</span>
                </div>
                <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <span className="mono-label text-accent font-bold text-[8px] leading-none">Borrador listo para Gmail</span>
                        <div className="flex flex-wrap gap-2">
                             <button 
                                onClick={() => copyToClipboard(emailBodyNormal, 'draft')}
                                className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest border border-neutral-200 px-3 py-1.5 hover:bg-black hover:text-white transition-all shadow-sm"
                            >
                                <span className="material-symbols-outlined text-[12px]">{emailCopied['draft'] ? 'done' : 'content_copy'}</span>
                                {emailCopied['draft'] ? 'Copiado' : 'Copiar cuerpo'}
                            </button>
                            <a 
                                href={gmailUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest bg-black text-white px-4 py-1.5 hover:bg-accent transition-all shadow-sm"
                            >
                                <span className="material-symbols-outlined text-[12px]">send</span>
                                Abrir Gmail
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="border border-neutral-200 p-4 bg-neutral-50/50 shadow-sm">
                            <div className="text-[9px] font-black uppercase mb-2">Asuntos sugeridos</div>
                            <ul className="text-[9px] text-neutral-600 space-y-1">
                                <li>• {emailSubjectPrimary}</li>
                                <li>• {emailSubjectAlt}</li>
                            </ul>
                        </div>
                        <div className="border border-neutral-200 p-4 bg-neutral-50/50 shadow-sm">
                            <div className="text-[9px] font-black uppercase mb-2">Plantilla por vertical</div>
                            <select
                                value={templateVariant}
                                onChange={(e) => setTemplateVariant(e.target.value)}
                                className="w-full border border-neutral-200 px-2 py-1 text-[9px] font-bold uppercase"
                            >
                                {['Cafetería alta rotación', 'Restaurante premium', 'Grupo multi-local', 'Take-away'].map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <div className="mt-2 text-[8px] text-neutral-400">Seleccionada: {templateVariant}</div>
                        </div>
                        <div className="border border-neutral-200 p-4 bg-neutral-50/50 shadow-sm">
                            <div className="text-[9px] font-black uppercase mb-2">Tracking de estado</div>
                            <div className="space-y-2 text-[9px] text-neutral-600">
                                {([
                                    { key: 'generated', label: 'Email generado' },
                                    { key: 'opened', label: 'Abierto en Gmail' },
                                    { key: 'sent', label: 'Enviado (manual)' }
                                ] as const).map((step) => (
                                    <label key={step.key} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={emailWorkflow[step.key]}
                                            onChange={(e) => setEmailWorkflow(prev => ({ ...prev, [step.key]: e.target.checked }))}
                                        />
                                        {step.label}
                                    </label>
                                ))}
                            </div>
                            <div className="mt-3 text-[8px] text-neutral-400 uppercase">
                                Variante A/B: {abVariant}
                            </div>
                            <div className="flex gap-2 mt-2">
                                {(['A', 'B'] as const).map((variant) => (
                                    <button
                                        key={variant}
                                        type="button"
                                        onClick={() => setAbVariant(variant)}
                                        className={`px-2 py-1 text-[8px] font-bold uppercase border ${abVariant === variant ? 'bg-black text-white border-black' : 'border-neutral-200 text-neutral-500'}`}
                                    >
                                        {variant}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="border border-neutral-200 p-6 bg-neutral-50/50 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="text-[9px] font-black uppercase mb-2">Versión corta (60-80 palabras)</div>
                                <div className="font-mono text-[10px] leading-relaxed text-neutral-700 whitespace-pre-wrap max-h-40 overflow-y-auto pr-4">
                                    {emailBodyShort}
                                </div>
                            </div>
                            <div>
                                <div className="text-[9px] font-black uppercase mb-2">Versión normal</div>
                                <div className="font-mono text-[10px] leading-relaxed text-neutral-700 whitespace-pre-wrap max-h-40 overflow-y-auto pr-4">
                                    {emailBodyNormal}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 6: INSIGHTS WOW */}
            <div className="flex gap-8 items-baseline">
                <div className="w-10 shrink-0">
                    <span className="mono-label text-accent font-bold text-[8px] leading-none">WOW</span>
                </div>
                <div className="flex-1 space-y-4">
                    <span className="mono-label text-accent font-bold text-[8px] leading-none block">Insights operativos</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="border border-neutral-200 p-4 bg-white shadow-sm">
                            <div className="text-[9px] font-black uppercase mb-2">Barra y picos</div>
                            <p className="text-[9px] text-neutral-500">
                                Alta probabilidad de cuello de botella en barra durante picos. Recomendar terminal fijo + cierre automático.
                            </p>
                        </div>
                        <div className="border border-neutral-200 p-4 bg-white shadow-sm">
                            <div className="text-[9px] font-black uppercase mb-2">Estimación de volumen</div>
                            <p className="text-[9px] text-neutral-500">
                                {profile.estimatedVolume || 'Volumen medio estimado'} · Ajusta propuesta comercial según capacidad.
                            </p>
                        </div>
                        <div className="border border-neutral-200 p-4 bg-white shadow-sm">
                            <div className="text-[9px] font-black uppercase mb-2">Guion de llamada</div>
                            <p className="text-[9px] text-neutral-500">"Hola, soy David de Honei. Hemos visto que {profile.businessName} tiene picos de demanda; ayudamos a reducir colas y comisiones con TPV integrado. ¿Quién gestiona pagos y cierres?"</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 7: CUMPLIMIENTO */}
            <div className="flex gap-8 items-baseline">
                <div className="w-10 shrink-0">
                    <span className="mono-label text-accent font-bold text-[8px] leading-none">GDPR</span>
                </div>
                <div className="flex-1 space-y-4">
                    <span className="mono-label text-accent font-bold text-[8px] leading-none block">Cumplimiento y base legal</span>
                    <div className="border border-neutral-200 p-4 bg-neutral-50/30 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-[9px] font-black uppercase">Base legítima confirmada</div>
                            <label className="flex items-center gap-2 text-[9px]">
                                <input
                                    type="checkbox"
                                    checked={hasLegalBasis}
                                    onChange={(e) => setHasLegalBasis(e.target.checked)}
                                />
                                Tengo base legítima
                            </label>
                        </div>
                        <p className="text-[9px] text-neutral-500">
                            Registra fuente, fecha y motivo de contacto. Si no hay base legítima, limita la personalización y usa plantilla consultiva.
                        </p>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 8: PRESENCIA */}
            <div className="flex gap-8 items-baseline">
                <div className="w-10 shrink-0">
                    <span className="mono-label text-accent font-bold text-[8px] leading-none">PRES</span>
                </div>
                <div className="flex-1 space-y-4">
                    <span className="mono-label text-accent font-bold text-[8px] leading-none block">Presencia digital y RRSS</span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <a 
                            href={profile.googleSearchSources?.[0]?.uri || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flat-card p-3 border border-neutral-100 flex items-center justify-between group shadow-sm"
                        >
                            <div className="flex flex-col truncate">
                                <span className="text-[7px] font-bold text-neutral-400 uppercase">Web</span>
                                <span className="text-[9px] font-bold truncate">Web corporativa</span>
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
                                    <span className="text-[9px] font-bold truncate">{social.handle || 'Ver perfil'}</span>
                                </div>
                                <span className="material-symbols-outlined text-[14px] text-neutral-300 group-hover:text-black">link</span>
                            </a>
                        )) : (
                            ['LinkedIn', 'Instagram', 'Maps'].map((platform, i) => (
                                <div key={i} className="flat-card p-3 border border-neutral-100 bg-neutral-50/50 opacity-50 flex items-center justify-between shadow-sm">
                                    <div className="flex flex-col">
                                        <span className="text-[7px] font-bold text-neutral-400 uppercase">{platform}</span>
                                        <span className="text-[9px] font-bold">No enlazado</span>
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
                    Nuevo objetivo
                </button>
            </div>
            <div className="h-20"></div>
        </div>
    );
};

export default ResultsDisplay;
