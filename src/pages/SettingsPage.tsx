import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Settings as SettingsIcon, Save, Info } from 'lucide-react';

export const SettingsPage: React.FC = () => {
    const { settings, updateSettings } = useSettings();
    const [name, setName] = useState(settings.systemName);
    const [icon, setIcon] = useState(settings.systemIcon);
    const [logo, setLogo] = useState(settings.systemLogo || '');
    const [favicon, setFavicon] = useState(settings.systemFavicon || '');
    const [isDarkMode, setIsDarkMode] = useState(settings.darkMode);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFavicon(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage('');

        await new Promise(resolve => setTimeout(resolve, 600));

        updateSettings({
            systemName: name,
            systemIcon: icon.charAt(0).toUpperCase(),
            systemLogo: logo,
            systemFavicon: favicon,
            darkMode: isDarkMode
        });

        setIsSaving(false);
        setMessage('¡Configuración actualizada con éxito!');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 max-w-full overflow-hidden">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración del Sistema</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Personaliza la identificación y apariencia de la plataforma.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 sticky top-24 transition-colors text-center">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-left">Vista Previa</h3>

                        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 space-y-4">
                            {logo ? (
                                <img src={logo} alt="System Logo" className="h-16 w-auto object-contain drop-shadow-md" />
                            ) : (
                                <div className="w-16 h-16 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-3xl">
                                    {icon.charAt(0).toUpperCase() || '?'}
                                </div>
                            )}
                            <div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white truncate">{name || 'Nombre del Sistema'}</p>
                                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest mt-1">Logo de Empresa</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-2 text-xs text-gray-500 dark:text-gray-400 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100/50 dark:border-blue-800/50 text-left">
                            <Info className="w-4 h-4 text-blue-500 shrink-0" />
                            <p>El logo personalizado reemplazará el icono de texto en la barra lateral y cabeceras si se especifica.</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex items-center space-x-2">
                            <SettingsIcon className="w-5 h-5 text-gray-400" />
                            <h3 className="font-semibold text-gray-900 dark:text-white">Identidad Visual</h3>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Nombre del Sistema"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="ej. Empresa S.A."
                                    required
                                />
                                <Input
                                    label="Icono (Solo si no hay logo)"
                                    value={icon}
                                    onChange={(e) => setIcon(e.target.value.slice(0, 1))}
                                    placeholder="ej. E"
                                    required
                                    maxLength={1}
                                />
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Logo Principal (Barra Lateral)</label>
                                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 border-dashed">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            id="logo-upload"
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="logo-upload"
                                            className="cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-lg border border-indigo-200 dark:border-indigo-900/50 text-sm font-semibold transition-all shadow-sm flex items-center"
                                        >
                                            <Save className="w-4 h-4 mr-2 rotate-90" />
                                            Subir Logo
                                        </label>
                                        {logo && (
                                            <button
                                                type="button"
                                                onClick={() => setLogo('')}
                                                className="text-xs text-red-500 hover:underline font-medium"
                                            >
                                                Quitar logo
                                            </button>
                                        )}
                                        <span className="text-xs text-gray-500 dark:text-gray-400 italic">SVG o PNG transparente recomendado</span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Icono de Pestaña (Favicon)</label>
                                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 border-dashed">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFaviconChange}
                                            id="favicon-upload"
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="favicon-upload"
                                            className="cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-lg border border-indigo-200 dark:border-indigo-900/50 text-sm font-semibold transition-all shadow-sm flex items-center"
                                        >
                                            <Save className="w-4 h-4 mr-2 rotate-90" />
                                            Subir Favicon
                                        </label>
                                        {favicon && (
                                            <div className="flex items-center gap-2">
                                                <img src={favicon} alt="Favicon" className="w-6 h-6 object-contain rounded" />
                                                <button
                                                    type="button"
                                                    onClick={() => setFavicon('')}
                                                    className="text-xs text-red-500 hover:underline font-medium"
                                                >
                                                    Quitar
                                                </button>
                                            </div>
                                        )}
                                        <span className="text-xs text-gray-500 dark:text-gray-400 italic">Cuadrado, 32x32px recomendado</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsDarkMode(!isDarkMode)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isDarkMode ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Activar Modo Oscuro por defecto</span>
                            </div>

                            <div className="pt-4 flex items-center justify-between">
                                {message ? (
                                    <span className="text-sm text-green-600 dark:text-green-400 font-medium animate-in fade-in slide-in-from-left-2 transition-all">
                                        {message}
                                    </span>
                                ) : <div />}

                                <Button type="submit" isLoading={isSaving} className="px-8 font-semibold">
                                    <Save className="w-4 h-4 mr-2" />
                                    Guardar Cambios
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
