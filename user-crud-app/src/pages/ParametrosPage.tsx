import React from 'react';
import { useSystemParameters } from '../context/SystemParameterContext';
import { Settings } from 'lucide-react';
import type { SystemParameter } from '../types';

export const ParametrosPage: React.FC = () => {
    const { parameters } = useSystemParameters();
    
    // Simplest possible mock for now to clear the error
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <Settings className="w-6 h-6 text-indigo-500" />
                Parámetros del Sistema
            </h1>
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8">
                <h2 className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-2">¿Qué son los Parámetros del Sistema?</h2>
                <p className="text-sm text-indigo-700 leading-relaxed">
                    Esta sección permite configurar los valores base y reglas de negocio del condominio. 
                    Aquí se definen aspectos críticos como el porcentaje de recargo por mora, el valor del fondo de reserva mensual, 
                    y los límites de montos para aprobar gastos de administración. Estos valores son utilizados por el motor de cálculo 
                    para generar las colillas de cobro y reportes financieros, asegurando que toda la automatización del sistema 
                    siga las normativas vigentes de su reglamento de copropiedad.
                </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-100 text-sm text-gray-500">
                            <th className="pb-3 font-medium">Nombre</th>
                            <th className="pb-3 font-medium">Tipo</th>
                            <th className="pb-3 font-medium">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {parameters.map((parameter: SystemParameter) => (
                            <tr key={parameter.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                <td className="py-3 text-gray-900 font-medium">{parameter.name}</td>
                                <td className="py-3 text-gray-500">{parameter.type}</td>
                                <td className="py-3">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${parameter.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {parameter.isActive ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {parameters.length === 0 && (
                            <tr>
                                <td colSpan={3} className="py-8 text-center text-gray-500">No hay parámetros registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
