import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Upload, Download, Info, CheckCircle2, XCircle, History, Database, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface BulkUploadLog {
    id: string;
    module: string;
    processed: number;
    created: number;
    updated: number;
    archived: number;
    status: string;
    dryRun: boolean;
    errorsJson: string;
    createdAt: string;
}

const LOAD_HIERARCHY = [
    { step: 1, title: 'Maestros Base', entities: ['torres', 'tipos_unidad'], description: 'Estructuras y tipos fundamentales.' },
    { step: 2, title: 'Infraestructura', entities: ['unidades', 'estacionamientos'], description: 'Mapeo de la propiedad física.' },
    { step: 3, title: 'Comunidad', entities: ['residentes', 'propietarios'], description: 'Personas vinculadas a unidades.' },
    { step: 4, title: 'Operaciones', entities: ['personal', 'articulos_personal'], description: 'RRHH y Logística.' }
];

export const CargaMasivaPage: React.FC = () => {
    const [masters, setMasters] = useState<string[]>([]);
    const [selectedEntity, setSelectedEntity] = useState<string>('residentes');
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState<any[]>([]);
    const [isDryRun, setIsDryRun] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState<BulkUploadLog[]>([]);

    React.useEffect(() => {
        fetch(`${API_BASE_URL}/bulk-masters`)
            .then(res => res.json())
            .then(setMasters)
            .catch(console.error);
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setStatus('idle');
            setMessage(`Archivo seleccionado: ${selectedFile.name}`);
            setErrors([]);
            setStats(null);
        }
    };

    const processFile = async () => {
        if (!file) return;
        setStatus('processing');
        setErrors([]);
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_BASE_URL}/bulk-import?dryRun=${isDryRun}`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (response.ok) {
                setStats(result);
                setStatus('success');
                setMessage(isDryRun ? 'Simulación completada' : 'Carga realizada con éxito');
            } else {
                setStatus('error');
                setMessage(result.error || 'Error al procesar el archivo');
            }
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message);
        }
    };

    const downloadEverything = () => {
        window.open(`${API_BASE_URL}/bulk-export`);
    };

    const downloadExcelTemplate = () => {
        window.open(`${API_BASE_URL}/bulk-export/${selectedEntity}`);
    };

    const fetchHistory = async () => {
        try {
            const resp = await fetch(`${API_BASE_URL}/bulk_upload_logs`);
            if (resp.ok) setHistory(await resp.json());
            setShowHistory(true);
        } catch (e) {
            console.error("Error fetching history", e);
        }
    };

    const deleteLog = async (id: string) => {
        if (!confirm('¿Eliminar este registro de auditoría?')) return;
        try {
            const resp = await fetch(`${API_BASE_URL}/bulk_upload_logs/${id}`, { method: 'DELETE' });
            if (resp.ok) setHistory(history.filter(log => log.id !== id));
        } catch (e) { console.error(e); }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 italic">
                        <Upload className="w-8 h-8 text-indigo-600" />
                        8.1.0 Carga Masiva (Backend-Driven)
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium ml-11 uppercase text-[10px] tracking-widest font-black italic">
                        Migrado a estándar SGC v1.0
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={fetchHistory} className="rounded-2xl font-black uppercase text-[10px] tracking-widest h-12 px-6">
                        <History className="w-4 h-4 mr-2" />
                        Ver Historial de Cargas
                    </Button>
                    <Button variant="secondary" onClick={() => window.location.reload()} className="rounded-2xl font-black uppercase text-[10px] tracking-widest h-12 px-6">
                        Refrescar
                    </Button>
                </div>
            </div>

            {/* Hierarchy Guide */}
            <div className="bg-indigo-600 shadow-2xl shadow-indigo-500/20 p-8 rounded-[3rem] text-white">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                        <Info className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight">Jerarquía de Carga Obligatoria</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {LOAD_HIERARCHY.map(h => (
                        <div key={h.step} className="bg-white/10 backdrop-blur-sm p-4 rounded-3xl border border-white/10 relative group hover:bg-white/20 transition-all">
                            <span className="absolute -top-3 -left-3 w-8 h-8 bg-white text-indigo-600 rounded-full flex items-center justify-center font-black shadow-lg">{h.step}</span>
                            <h3 className="font-black text-sm mb-1 uppercase text-indigo-100">{h.title}</h3>
                            <p className="text-[10px] opacity-70 leading-tight">{h.description}</p>
                            {h.step < 4 && <ArrowRight className="hidden md:block absolute -right-6 top-1/2 transform -translate-y-1/2 opacity-30" />}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Selector */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Seleccionar Maestro</h3>
                        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="space-y-1">
                                {masters.map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setSelectedEntity(m)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${selectedEntity === m ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                                    >
                                        <Database className={`w-4 h-4 ${selectedEntity === m ? 'text-white' : 'text-indigo-500'}`} />
                                        <span className="text-xs font-bold uppercase">{m.replace(/_/g, ' ')}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-900 p-10 rounded-[3.5rem] border border-gray-100 dark:border-gray-800 shadow-xl min-h-[450px] flex flex-col items-center justify-center text-center">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl ${status === 'processing' ? 'animate-pulse bg-indigo-100 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
                            {status === 'success' ? <CheckCircle2 className="w-12 h-12 text-emerald-500" /> : <Upload className="w-12 h-12" />}
                        </div>
                        
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 italic">
                            {status === 'processing' ? 'Procesando Maestros...' : 'Cargador Universal SGC'}
                        </h2>
                        <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">
                            {message || 'Suba un archivo Excel. La resolución de relaciones y validaciones se ejecutarán en el servidor.'}
                        </p>

                        <div className="flex items-center gap-3 mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <input 
                                type="checkbox" 
                                id="dryRunToggle"
                                checked={isDryRun} 
                                onChange={(e) => setIsDryRun(e.target.checked)}
                                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                            />
                            <label htmlFor="dryRunToggle" className="text-xs font-black text-gray-700 dark:text-gray-300 cursor-pointer uppercase tracking-tighter">
                                Modo Simulación (Validar sin guardar cambios)
                            </label>
                        </div>

                        {!file && status !== 'processing' && (
                            <label className="group relative">
                                <input type="file" accept=".xlsx" onChange={handleFileChange} className="hidden" />
                                <div className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-500/30 group-hover:scale-105 transition-transform cursor-pointer">
                                    Seleccionar Excel
                                </div>
                            </label>
                        )}

                        {file && status !== 'processing' && !stats && (
                            <div className="mt-8 flex gap-3 justify-center">
                                <Button variant="secondary" onClick={() => setFile(null)} className="rounded-2xl text-[10px]">Cancelar</Button>
                                <Button onClick={processFile} className={`rounded-2xl text-[10px] ${isDryRun ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                                    {isDryRun ? 'Ejecutar Simulación' : 'Iniciar Sincronización Real'}
                                </Button>
                            </div>
                        )}

                        {status === 'success' && stats && (
                            <div className="mt-8 w-full space-y-4">
                                {Object.entries(stats.results).map(([name, res]: [string, any]) => (
                                    <div key={name} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 italic">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-black text-indigo-600 uppercase">{name}</span>
                                            <span className="text-[10px] text-gray-400">{res.errors.length} errores</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="text-center">
                                                <p className="text-[9px] font-black text-emerald-600">CREAR</p>
                                                <p className="text-lg font-black">{res.summary.created}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[9px] font-black text-blue-600">UPDATE</p>
                                                <p className="text-lg font-black">{res.summary.updated}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[9px] font-black text-red-600">ARCHIVE</p>
                                                <p className="text-lg font-black">{res.summary.archived}</p>
                                            </div>
                                        </div>
                                        {res.errors.length > 0 && (
                                            <div className="mt-2 text-[9px] text-red-500 font-bold border-t border-red-50 pt-2">
                                                {res.errors.slice(0, 3).map((e: string, i: number) => <p key={i}>• {e}</p>)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {stats.backup && (
                                    <p className="text-[10px] text-gray-400 uppercase italic">Respaldo generado: {stats.backup}</p>
                                )}
                            </div>
                        )}

                        {errors.length > 0 && (
                            <div className="mt-8 w-full text-left bg-red-50 p-6 rounded-[2rem] border border-red-100">
                                <h4 className="text-xs font-black text-red-600 uppercase mb-4 flex items-center gap-2 italic">
                                    <XCircle className="w-4 h-4" /> Errores Estructurados ({errors.length})
                                </h4>
                                <div className="max-h-40 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                    {errors.map((e, idx) => (
                                        <div key={idx} className="text-[10px] border-b border-red-200 pb-2 italic">
                                            <div className="flex justify-between font-black mb-1">
                                                <span>FILA {e.row} - [{e.sheet}]</span>
                                                <span className="text-red-800 uppercase">{e.module}</span>
                                            </div>
                                            <p className="text-red-700 font-bold">{e.error}</p>
                                            <p className="opacity-50 mt-1 truncate">VALOR: {e.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-between p-2">
                     <div className="flex flex-wrap justify-between p-2 gap-2">
                        <Button variant="secondary" onClick={downloadEverything} className="text-[10px] font-black h-10 px-6 rounded-2xl italic">
                            <Download className="w-3 h-3 mr-2" /> Descargar Todo (Sincronización Total)
                        </Button>
                        <Button variant="secondary" onClick={downloadExcelTemplate} className="text-[10px] font-black h-10 px-6 rounded-2xl italic">
                            <Download className="w-3 h-3 mr-2" /> Plantilla de {selectedEntity.toUpperCase()}
                        </Button>
                        <Button variant="secondary" onClick={() => window.open(API_BASE_URL + '/health')} className="text-[10px] font-black h-10 px-6 rounded-2xl italic">
                            <CheckCircle2 className="w-3 h-3 mr-2" /> Verificar Salud API
                        </Button>
                    </div>
                    </div>
                </div>
            </div>

            {/* History Overlay */}
            {showHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800">
                        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h2 className="text-2xl font-black italic flex items-center gap-3">
                                <History className="w-6 h-6 text-indigo-600" />
                                Historial de Auditoría (8.1.0)
                            </h2>
                            <Button variant="secondary" onClick={() => setShowHistory(false)} className="rounded-2xl">Cerrar</Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {history.length === 0 ? (
                                <div className="text-center py-20 text-gray-400">No hay registros de carga real disponibles.</div>
                            ) : (
                                <div className="space-y-4">
                                    {history.map(log => {
                                        const results = log.errorsJson ? JSON.parse(log.errorsJson).results : {};
                                        return (
                                            <div key={log.id} className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700 group relative">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                                                                log.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 
                                                                log.status === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                            }`}>
                                                                {log.status}
                                                            </span>
                                                            <span className="text-[10px] font-black text-indigo-600 uppercase italic">Sincronización Global</span>
                                                        </div>
                                                        <p className="text-xs font-black text-gray-900 dark:text-white">
                                                            {new Date(log.createdAt).toLocaleString('es-CL')}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resumen</p>
                                                        <p className="text-sm font-black">+{log.created} | ~{log.updated} | -{log.archived}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                                                    {Object.keys(results).map(key => (
                                                        <span key={key} className="text-[9px] bg-white dark:bg-gray-900 px-2 py-1 rounded-lg border border-gray-100 text-gray-500 uppercase">{key}</span>
                                                    ))}
                                                </div>
                                                <button 
                                                    onClick={() => deleteLog(log.id)}
                                                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 transition-all"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
