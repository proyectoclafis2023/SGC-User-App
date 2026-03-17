import React, { useState, useRef } from 'react';
import { useArticles } from '../context/ArticleContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Plus, Trash2, Edit2, X, Shirt, Search, ShieldCheck, Briefcase, Filter, AlertTriangle, Download, Package, Tag } from 'lucide-react';
import { useSystemParameters } from '../context/SystemParameterContext';
import type { Article } from '../types';

export const ArticlesPage: React.FC = () => {
    const { articles, addArticle, updateArticle, deleteArticle, uploadArticles } = useArticles();
    const { parameters } = useSystemParameters();
    const articleCategories = parameters.filter(p => p.type === 'article_category');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState(0);
    const [stock, setStock] = useState(0);
    const [minStock, setMinStock] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [allowPersonnelRequest, setAllowPersonnelRequest] = useState(false);
    const [unit, setUnit] = useState('unidades');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

    const handleOpenModal = (art?: Article) => {
        if (art) {
            setEditingArticle(art);
            setName(art.name);
            setDescription(art.description || '');
            setCategory(art.category);
            setPrice(art.price || 0);
            setStock(art.stock || 0);
            setMinStock(art.minStock || 0);
            setIsActive(art.isActive !== undefined ? art.isActive : true);
            setAllowPersonnelRequest(art.allowPersonnelRequest || false);
            setUnit(art.unit || 'unidades');
        } else {
            setEditingArticle(null);
            setName('');
            setDescription('');
            setCategory(articleCategories[0]?.name || '');
            setPrice(0);
            setStock(0);
            setMinStock(0);
            setIsActive(true);
            setAllowPersonnelRequest(false);
            setUnit('unidades');
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = { name, description, category, unit, price: Number(price), stock: Number(stock), minStock: Number(minStock), isActive, allowPersonnelRequest };
        if (editingArticle) {
            await updateArticle({ ...editingArticle, ...data });
        } else {
            await addArticle(data);
        }
        setIsModalOpen(false);
    };

    const handleExportCSV = () => {
        const headers = ['ID', 'Nombre', 'Categoría', 'Stock', 'Stock Mínimo', 'Precio', 'Activo', 'Archivado'];
        const rows = (articles || []).map(a => [
            a.id,
            a.name,
            a.category,
            a.stock,
            a.minStock,
            a.price,
            a.isActive ? 'SI' : 'NO',
            a.isArchived ? 'SI' : 'NO'
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "reporte_articulos.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredArticles = (articles || []).filter(a => {
        if (a.isArchived) return false;
        const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const isLowStock = a.minStock > 0 && a.stock <= a.minStock;
        const matchesCategory = categoryFilter === 'all' ||
            (categoryFilter === 'low-stock' ? isLowStock : a.category === categoryFilter);
        return matchesSearch && matchesCategory;
    });

    const stats = {
        total: articles.length,
        lowStock: articles.filter(a => a.minStock > 0 && a.stock <= a.minStock).length,
        totalValue: articles.reduce((acc, a) => acc + (a.price * a.stock), 0),
        categories: Array.from(new Set(articles.map(a => a.category))).length
    };

    const categoryDistribution = articles.reduce((acc: Record<string, number>, a) => {
        acc[a.category] = (acc[a.category] || 0) + 1;
        return acc;
    }, {});

    const maxCategoryCount = Math.max(...Object.values(categoryDistribution), 1);

    const handleLoadBaseArticles = async () => {
        const base = [
            { name: 'Guantes de Nitrilo (Caja 100)', description: 'Talla M/L para aseo y manipulación.', category: 'EPP', price: 12500, stock: 10, minStock: 5, unit: 'cajas', allowPersonnelRequest: true },
            { name: 'Jabón Líquido Neutro 5L', description: 'Bidón para recambio en baños comunes.', category: 'Aseo', price: 8900, stock: 4, minStock: 2, unit: 'bidones', allowPersonnelRequest: true },
            { name: 'Papel Higiénico Jumbo Roll', description: 'Pack 4 rollos de alto metraje.', category: 'Aseo', price: 15600, stock: 20, minStock: 8, unit: 'packs', allowPersonnelRequest: true },
            { name: 'Escoba Uso Rudo', description: 'Cerdas plásticas reforzadas.', category: 'Aseo', price: 4500, stock: 6, minStock: 2, unit: 'unidades', allowPersonnelRequest: true },
            { name: 'Ampolleta LED 9W E27', description: 'Luz fría para pasillos y escalas.', category: 'Ferretería', price: 1990, stock: 50, minStock: 15, unit: 'unidades', allowPersonnelRequest: true },
            { name: 'Cinta Embalaje Transparente', description: 'Uso oficina y conserjería.', category: 'Oficina', price: 1200, stock: 12, minStock: 4, unit: 'rollos', allowPersonnelRequest: true }
        ];

        for (const art of base) {
            if (!articles.find(a => a.name.toLowerCase() === art.name.toLowerCase())) {
                const { id, ...artData } = art as any;
                await addArticle(artData);
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        Maestro Insumos y EPP
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium ml-1">E.P.P, Artículos de Aseo, Materiales de Oficina e Insumos diarios.</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                try {
                                    const result = await uploadArticles(file);
                                    alert(result.message);
                                } catch (err: any) {
                                    alert(err.message);
                                }
                            }
                        }}
                    />
                    <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Carga Masiva
                    </Button>
                    <Button variant="secondary" onClick={handleExportCSV}>
                        <Download className="w-4 h-4 mr-2" />
                        Exportar CSV
                    </Button>
                    <Button onClick={() => handleOpenModal()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Artículo
                    </Button>
                </div>
            </div>

            {/* Volumetry & Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Insumos</p>
                        <p className="text-3xl font-black text-indigo-600">{stats.total}</p>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full mt-4">
                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Stock Crítico</p>
                        <p className={`text-3xl font-black ${stats.lowStock > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{stats.lowStock}</p>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full mt-4">
                            <div className={`${stats.lowStock > 0 ? 'bg-rose-500' : 'bg-emerald-500'} h-full rounded-full`} style={{ width: `${(stats.lowStock / (stats.total || 1)) * 100}%` }}></div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Valor Inventario</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">${stats.totalValue.toLocaleString()}</p>
                        <p className="text-[9px] text-gray-400 font-bold mt-2">Valorización estimada</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Categorías</p>
                        <p className="text-3xl font-black text-amber-500">{stats.categories}</p>
                        <div className="flex gap-1 mt-4">
                            {Object.keys(categoryDistribution).slice(0, 5).map(cat => (
                                <div key={cat} className="h-1.5 bg-amber-200 rounded-full flex-1" title={cat}></div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 transform translate-x-4 -translate-y-4 transition-transform group-hover:scale-110">
                        <Tag className="w-24 h-24 text-indigo-600" />
                    </div>
                    <h3 className="text-[11px] font-black uppercase tracking-widest mb-4 text-indigo-600">Distribución</h3>
                    <div className="space-y-3">
                        {Object.entries(categoryDistribution).slice(0, 4).map(([cat, count]) => (
                            <div key={cat} className="space-y-1">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-gray-600 dark:text-gray-400">
                                    <span>{cat}</span>
                                    <span>{count}</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${(count / maxCategoryCount) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o descripción..."
                        className="w-full h-12 pl-12 pr-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl gap-1">
                    <button 
                        onClick={() => setViewMode('table')}
                        className={`p-2 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-400'}`}
                        title="Vista Tabla"
                    >
                        <Filter className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-400'}`}
                        title="Vista Grilla"
                    >
                        <Package className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
                    <button
                        onClick={() => setCategoryFilter('all')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${categoryFilter === 'all' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400 hover:border-indigo-300'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setCategoryFilter('low-stock')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${categoryFilter === 'low-stock' ? 'bg-rose-500 border-rose-500 text-white shadow-lg' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-rose-400 hover:border-rose-300'}`}
                    >
                        <AlertTriangle className="w-3.5 h-3.5 inline mr-1" /> Stock Bajo
                    </button>
                    {articleCategories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setCategoryFilter(cat.name)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${categoryFilter === cat.name ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400 hover:border-indigo-300'}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                    {articles.length === 0 && (
                        <Button variant="ghost" size="sm" onClick={handleLoadBaseArticles} className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50">
                            <Plus className="w-3 h-3 mr-1" /> Cargar Base
                        </Button>
                    )}
                </div>
            </div>

            {viewMode === 'table' ? (
                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-xl animate-in fade-in duration-500">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Artículo</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Categoría</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Stock</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Precio</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {filteredArticles.map((art) => (
                                    <tr key={art.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 dark:text-white text-sm">{art.name}</span>
                                                <span className="text-[10px] text-gray-400 font-medium truncate max-w-[200px]">{art.description || 'Sin descripción'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-200/50 dark:border-gray-700">
                                                {art.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-sm font-black ${art.stock <= art.minStock ? 'text-rose-500 animate-pulse' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {art.stock} {art.unit}
                                                </span>
                                                {art.stock <= art.minStock && (
                                                    <span className="text-[8px] font-black uppercase text-rose-400 tracking-tighter">Bajo Stock (Mín: {art.minStock})</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">${art.price.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenModal(art)} className="p-2 text-gray-400 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => deleteArticle(art.id)} className="p-2 text-gray-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredArticles.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <Package className="w-12 h-12 text-gray-200 mb-3" />
                                                <p className="text-gray-400 font-medium">No se encontraron artículos.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-500">
                    {filteredArticles.map((art) => (
                        <div key={art.id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-black px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/30">
                                    {art.category}
                                </span>
                                {art.stock <= art.minStock && <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />}
                            </div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white truncate mb-1">{art.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 min-h-[32px]">{art.description || 'Sin descripción adicional.'}</p>
                            
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Stock</p>
                                    <p className={`text-lg font-black ${art.stock <= art.minStock ? 'text-rose-500' : 'text-gray-900 dark:text-white'}`}>
                                        {art.stock} <span className="text-[9px] font-bold opacity-50">{art.unit}</span>
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Precio</p>
                                    <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">${art.price.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                <button
                                    onClick={() => handleOpenModal(art)}
                                    className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                                >
                                    <Edit2 className="w-3.5 h-3.5" /> Editar
                                </button>
                                <button
                                    onClick={() => deleteArticle(art.id)}
                                    className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl border border-white/20 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Shirt className="w-5 h-5 text-indigo-600" />
                                {editingArticle ? 'Editar Artículo' : 'Nuevo Artículo'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <Input label="Nombre del Artículo" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ej: Zapatos de Seguridad" />
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Categoría</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full h-[42px] px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none transition-all"
                                >
                                    <option value="" disabled>Seleccione una categoría</option>
                                    {articleCategories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                    {articleCategories.length === 0 && <option value="Otro">Otro</option>}
                                </select>
                            </div>
                            <Input label="Unidad de Medida" value={unit} onChange={(e) => setUnit(e.target.value)} required placeholder="Ej: unidades, kg, litros, cajas" />
                            <Input
                                label="Precio Unitario ($)"
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                required
                                min="0"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Stock Actual"
                                    type="number"
                                    value={stock}
                                    onChange={(e) => setStock(Number(e.target.value))}
                                    required
                                    min="0"
                                />
                                <Input
                                    label="Stock Mínimo"
                                    type="number"
                                    value={minStock}
                                    onChange={(e) => setMinStock(Number(e.target.value))}
                                    required
                                    min="0"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Descripción</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full h-24 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-sm outline-none transition-all focus:ring-4 focus:ring-indigo-500/10"
                                    placeholder="Detalles adicionales..."
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Estado del Artículo</p>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{isActive ? 'Disponible' : 'No disponible'}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsActive(!isActive)}
                                    className={`w-12 h-6 rounded-full transition-all relative ${isActive ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isActive ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${allowPersonnelRequest ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Solicitud por Personal</p>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{allowPersonnelRequest ? 'Permitido' : 'No permitido'}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAllowPersonnelRequest(!allowPersonnelRequest)}
                                    className={`w-12 h-6 rounded-full transition-all relative ${allowPersonnelRequest ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${allowPersonnelRequest ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit">Guardar Artículo</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
