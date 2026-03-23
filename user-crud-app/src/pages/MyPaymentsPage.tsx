import React, { useState } from 'react';
import { useCommonExpenses } from '../context/CommonExpenseContext';
import { useInfrastructure } from '../context/InfrastructureContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { 
    CreditCard, Calendar, ArrowRight, CheckCircle2, 
    AlertCircle, History, Landmark, Receipt, X, DollarSign,
    Filter
} from 'lucide-react';
import type { CommonExpensePayment } from '../types';

export const MyPaymentsPage: React.FC = () => {
    const { payments, actualPayments, addActualPayment } = useCommonExpenses();
    const { departments } = useInfrastructure();
    
    const [selectedDeptId, setSelectedDeptId] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState<CommonExpensePayment | null>(null);
    
    // Form fields
    const [amount, setAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('transfer');
    const [reference, setReference] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Filter payments by selected department
    const deptDebts = payments.filter(p => !selectedDeptId || p.department_id === selectedDeptId);
    const deptTransactions = actualPayments.filter(p => !selectedDeptId || p.department_id === selectedDeptId);

    const handlePayClick = (debt: CommonExpensePayment) => {
        setSelectedDebt(debt);
        setAmount(debt.amount_paid); // In v2.3.0 amount_paid IS the debt amount
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDebt) return;

        try {
            await addActualPayment({
                amount,
                payment_date: new Date(date).toISOString(),
                payment_method: paymentMethod,
                reference,
                common_expense_payment_id: selectedDebt.id,
                department_id: selectedDebt.department_id,
                is_archived: false
            });
            setIsModalOpen(false);
            setSelectedDebt(null);
            setReference('');
        } catch (err: any) {
            alert(err.message);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'partial': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            default: return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'paid': return 'Pagado';
            case 'partial': return 'Pago Parcial';
            default: return 'Pendiente';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3 text-gray-900 dark:text-white">
                        <CreditCard className="text-indigo-600 w-10 h-10" /> Mis Pagos y Deudas
                    </h1>
                    <p className="text-gray-500 font-bold">Consulte su estado de cuenta y registre pagos realizados.</p>
                </div>
                
                <div className="flex items-center gap-3 bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <Filter className="w-5 h-5 text-gray-400 ml-2" />
                    <select 
                        className="bg-transparent text-sm font-black outline-none min-w-[200px]"
                        value={selectedDeptId}
                        onChange={(e) => setSelectedDeptId(e.target.value)}
                    >
                        <option value="">Todas mis unidades</option>
                        {departments.map(d => (
                            <option key={d.id} value={d.id}>Depto {d.number} - Torre {d.tower?.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Column 1: Pending Debts */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Receipt className="text-rose-500 w-6 h-6" />
                        <h2 className="text-xl font-black">Cuentas Pendientes</h2>
                    </div>

                    {deptDebts.filter(d => d.status !== 'paid').length === 0 ? (
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 border-2 border-dashed border-emerald-200 dark:border-emerald-800 rounded-[3rem] p-12 text-center">
                            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                            <p className="text-emerald-700 dark:text-emerald-400 font-black text-xl italic">¡Al día! No tiene deudas pendientes.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {deptDebts.filter(d => d.status !== 'paid').map(debt => (
                                <div key={debt.id} className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Landmark className="w-20 h-20" />
                                    </div>
                                    
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Periodo</p>
                                            <p className="text-lg font-black text-gray-900 dark:text-white capitalize">
                                                {new Date(debt.period_year, debt.period_month - 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getStatusColor(debt.status)}`}>
                                            {getStatusLabel(debt.status)}
                                        </span>
                                    </div>

                                    <div className="mb-6">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total a Pagar</p>
                                        <p className="text-4xl font-black text-rose-600">${debt.amount_paid.toLocaleString()}</p>
                                    </div>

                                    <button 
                                        onClick={() => handlePayClick(debt)}
                                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30"
                                    >
                                        <DollarSign className="w-4 h-4" /> Informar Pago
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Column 2: Recent Transactions */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <History className="text-indigo-500 w-6 h-6" />
                        <h2 className="text-xl font-black">Historial Reciente</h2>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        {deptTransactions.length === 0 ? (
                            <div className="p-12 text-center">
                                <History className="text-gray-200 w-12 h-12 mx-auto mb-3" />
                                <p className="text-gray-400 font-bold italic text-sm">Sin historial de pagos.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50 dark:divide-gray-800">
                                {deptTransactions.map(t => (
                                    <div key={t.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-sm font-black text-gray-900 dark:text-white">Abono Realizado</p>
                                            <p className="text-sm font-black text-emerald-600">+ ${t.amount.toLocaleString()}</p>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(t.payment_date).toLocaleDateString()}
                                            </div>
                                            <p>{t.payment_method}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-[4rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10">
                        <div className="p-10 border-b dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/10 dark:to-gray-900">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white">Registrar Abono</h2>
                                <p className="text-indigo-600 font-bold text-sm">Informe el depósito para saldar su deuda.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-rose-500 hover:text-white bg-gray-100 dark:bg-gray-800 rounded-3xl transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-3xl border border-rose-100 dark:border-rose-900/30 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Pendiente total</p>
                                    <p className="text-2xl font-black text-rose-700 dark:text-rose-400">
                                        ${selectedDebt?.amount_paid.toLocaleString()}
                                    </p>
                                </div>
                                <ArrowRight className="text-rose-300 w-8 h-8" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="Monto a Pagar ($)" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} required />
                                <Input label="Fecha Depósito" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-400 uppercase ml-2 tracking-widest">Método de Pago</label>
                                    <select
                                        className="w-full p-5 rounded-[2rem] border-4 border-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-sm font-black outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    >
                                        <option value="transfer">Transferencia</option>
                                        <option value="deposit">Depósito Caja Vecina</option>
                                        <option value="cash">Efectivo (Conserjería)</option>
                                        <option value="card">Webpay / Débito</option>
                                    </select>
                                </div>
                                <Input label="N° Comprobante / Ref" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Opcional" />
                            </div>

                            <div className="flex items-center gap-3 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/30">
                                <AlertCircle className="text-amber-600 w-6 h-6 flex-shrink-0" />
                                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold leading-relaxed uppercase tracking-tighter">
                                    Su pago será validado por administración. Guarde su comprobante físico o digital.
                                </p>
                            </div>

                            <Button type="submit" className="w-full py-6 text-sm font-black uppercase tracking-widest rounded-3xl gap-3 shadow-xl shadow-indigo-500/30">
                                <CheckCircle2 className="w-6 h-6" /> Confirmar Pago
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
