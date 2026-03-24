import React, { useState } from 'react';
import { useArticles } from '../context/ArticleContext';
import { useArticleDeliveries } from '../context/ArticleDeliveryContext';
import { useAuth } from '../context/AuthContext';
import { Package, Search, ShoppingCart, CheckCircle2, LayoutGrid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../context/TicketContext';

export const SolicitudInsumosPage: React.FC = () => {
    const navigate = useNavigate();
    const { articles } = useArticles();
    const { addDelivery } = useArticleDeliveries();
    const { user } = useAuth();
    const { addTicket } = useTickets();
    const [searchTerm, setSearchTerm] = useState('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Filter articles that can be requested by staff and deduplicate by name
    const requestableArticles = articles.filter((a: any) => 
        a.allowPersonnelRequest && !a.is_archived && a.isActive
    );

    // Deduplicate by normalized name to avoid visual "saturation" and duplicates like "café" vs "café" (normalization) or "Cafe"
    const uniqueArticles = Array.from(
        new Map(
            requestableArticles.map((a: any) => [
                a.name.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
                a
            ])
        ).values()
    );

    const filteredArticles = uniqueArticles.filter((a: any) =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate Category distribution for the chart
    const categoryStats = React.useMemo(() => {
        const stats: Record<string, number> = {};
        requestableArticles.forEach((a: any) => {
            stats[a.category] = (stats[a.category] || 0) + 1;
        });
        const total = requestableArticles.length;
        return Object.entries(stats).map(([name, count]) => ({
            name,
            count,
            percentage: total > 0 ? (count / total) * 100 : 0
        })).sort((a, b) => b.count - a.count);
    }, [requestableArticles]);

    const CATEGORY_COLORS: Record<string, string> = {
        'Cafetería': 'bg-amber-500',
        'Oficina': 'bg-blue-500',
        'Aseo': 'bg-emerald-500',
        'EPP': 'bg-orange-500',
        'Insumos': 'bg-indigo-500',
        'Otro': 'bg-gray-400'
    };

    const handleRequest = async (articleId: string, articleName: string) => {
        try {
            await addDelivery({
                personnel_id: user?.relatedId || 'staff-request',
                delivery_date: new Date().toISOString(),
                articles: [{
                    article_id: articleId,
                    quantity: 1
                }],
                notes: `Solicitud directa de personal: ${user?.name || 'Usuario'}`,
                status: 'active',
                signed_document: ''
            });

            // Generar correlativo tipo ticket
            await addTicket({
                resident_id: user?.relatedId || 'staff-request',
                type: 'provision_request',
                subject: `Solicitud de Insumo: ${articleName}`,
                description: `El funcionario ${user?.name || 'Personal'} ha solicitado ${articleName}.`,
                status: 'open'
            });

            setSuccessMessage(`Solicitud de ${articleName} enviada con éxito.`);
            setSearchTerm('');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error('Error requesting article:', error);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header with Glassmorphism Effect */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 p-8 md:p-12 rounded-[3.5rem] shadow-2xl shadow-emerald-500/20 text-white">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <h1 className="text-4xl md:text-5xl font-black flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                                <Package className="w-9 h-9" />
                            </div>
                            Solicitud de Insumos
                        </h1>
                        <p className="text-emerald-50/80 text-lg font-medium leading-relaxed">
                            Portal de autoservicio para el equipo SGC. Solicita materiales, insumos de oficina y cafetería de forma rápida y digital.
                        </p>
                    </div>
                    
                    <div className="flex flex-col gap-6 w-full md:w-fit">
                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-300 group-focus-within:text-white transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar insumos (café, azúcar, papel...)"
                                className="w-full pl-14 pr-6 py-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-emerald-200/50 font-bold focus:outline-none focus:ring-4 focus:ring-white/10 focus:bg-white/20 transition-all text-sm"
                                value={searchTerm}
                                onChange={(e: any) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Distribution Chart */}
                        <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-5 border border-white/10">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-emerald-200">Distribución por Categorías</h4>
                            <div className="flex flex-col gap-3">
                                <div className="h-3 w-full bg-white/10 rounded-full flex overflow-hidden">
                                    {categoryStats.map((stat, idx) => (
                                        <div 
                                            key={stat.name} 
                                            style={{ width: `${stat.percentage}%` }}
                                            className={`${CATEGORY_COLORS[stat.name] || 'bg-white/40'} ${idx === 0 ? 'rounded-l-full' : ''} ${idx === categoryStats.length - 1 ? 'rounded-r-full' : ''} h-full transition-all duration-1000`}
                                            title={`${stat.name}: ${stat.count} items`}
                                        />
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-2">
                                    {categoryStats.slice(0, 4).map(stat => (
                                        <div key={stat.name} className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[stat.name] || 'bg-white/40'}`}></div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/70">{stat.name} ({stat.count})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Message & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {successMessage ? (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 p-6 rounded-[2.5rem] flex items-center gap-4 animate-in zoom-in duration-300 shadow-sm flex-1">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <span className="font-black uppercase tracking-tight text-sm">{successMessage}</span>
                    </div>
                ) : (
                    <div className="flex-1"></div>
                )}

                <div className="flex p-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-2xl w-fit">
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-2.5 rounded-xl flex items-center gap-2 transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest px-1">Grilla</span>
                    </button>
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-2.5 rounded-xl flex items-center gap-2 transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <List className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest px-1">Tabla</span>
                    </button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredArticles.length > 0 ? filteredArticles.map((article: any) => (
                        <div key={article.id} className="bg-white dark:bg-gray-900 overflow-hidden rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none flex flex-col group hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300">
                            <div className="relative h-40 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 flex items-center justify-center p-6 overflow-hidden">
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-emerald-600/10 to-transparent"></div>
                                <Package className="w-16 h-16 text-gray-200 dark:text-gray-700 group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute top-6 left-6">
                                    <span className="px-5 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                                        {article.category}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-emerald-600 transition-colors">
                                    {article.name}
                                </h3>
                                
                                <div className="inline-flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    <div className={`w-1.5 h-1.5 rounded-full ${article.stock > article.minStock ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                    {article.stock} {article.unit || 'unidades'}
                                </div>
                                
                                <div className="mt-auto">
                                    <button 
                                        onClick={() => handleRequest(article.id, article.name)}
                                        className="w-full py-3 rounded-xl bg-gray-900 dark:bg-emerald-600 font-black uppercase tracking-widest text-[10px] text-white shadow-xl shadow-gray-900/10 hover:bg-emerald-600 hover:shadow-emerald-500/20 active:scale-95 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                                        disabled={article.stock <= 0}
                                    >
                                        <ShoppingCart className="w-3.5 h-3.5" />
                                        Solicitar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-32 text-center rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/10">
                            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Package className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-300 dark:text-gray-700 uppercase tracking-widest">Sin resultados</h3>
                            <p className="text-gray-400 dark:text-gray-500 font-bold mt-2">No se encontraron insumos disponibles que coincidan con tu búsqueda.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Artículo</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Categoría</th>
                                    <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">Stock</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {filteredArticles.map((article: any) => (
                                    <tr key={article.id} className="group hover:bg-emerald-50/30 dark:hover:bg-emerald-900/5 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                                                    <Package className="w-5 h-5 text-gray-400" />
                                                </div>
                                                <span className="font-black text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{article.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                                {article.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <div className="inline-flex items-center gap-2 text-[11px] font-black">
                                                <div className={`w-1.5 h-1.5 rounded-full ${article.stock > article.minStock ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                                {article.stock} {article.unit || 'unidades'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button 
                                                onClick={() => handleRequest(article.id, article.name)}
                                                className="px-6 py-2.5 rounded-xl bg-gray-900 dark:bg-emerald-600 font-black uppercase tracking-widest text-[9px] text-white hover:bg-emerald-600 active:scale-95 disabled:bg-gray-200 dark:disabled:bg-gray-800 transition-all flex items-center gap-2 ml-auto"
                                                disabled={article.stock <= 0}
                                            >
                                                <ShoppingCart className="w-3 h-3" />
                                                Solicitar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredArticles.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs italic">
                                            No hay resultados para mostrar
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            <div className="flex justify-center pt-8">
                <button 
                    onClick={() => navigate('/')} 
                    className="group flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] text-gray-400 hover:text-emerald-600 transition-all"
                >
                    <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center group-hover:border-emerald-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-all">
                        <Search className="w-4 h-4 opacity-50 rotate-90" />
                    </div>
                    Volver al Dashboard
                </button>
            </div>
        </div>
    );
};
