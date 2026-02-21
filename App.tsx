import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Minus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Trash2, 
  Calendar as CalendarIcon,
  PieChart as PieChartIcon,
  List as ListIcon,
  X
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Transaction, CATEGORIES } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#71717a'];

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount || !date) return;

    const newTransaction = {
      type,
      category,
      amount: parseFloat(amount),
      date,
      description
    };

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction)
      });
      if (res.ok) {
        fetchTransactions();
        setIsModalOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const deleteTransaction = async (id: number) => {
    try {
      await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const resetForm = () => {
    setType('expense');
    setCategory('');
    setAmount('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setDescription('');
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const chartData = Object.entries(
    transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <Wallet size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Finanças</h1>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
          >
            <Plus size={18} />
            Novo Gasto
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Saldo Total</span>
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                <Wallet size={20} />
              </div>
            </div>
            <div className={cn(
              "text-3xl font-bold",
              balance >= 0 ? "text-slate-900" : "text-rose-600"
            )}>
              {formatCurrency(balance)}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Receitas</span>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="text-3xl font-bold text-emerald-600">
              {formatCurrency(totalIncome)}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Despesas</span>
              <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                <TrendingDown size={20} />
              </div>
            </div>
            <div className="text-3xl font-bold text-rose-600">
              {formatCurrency(totalExpenses)}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Transactions List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ListIcon size={20} className="text-slate-400" />
                Transações Recentes
              </h2>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-slate-400">Carregando...</div>
              ) : transactions.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                    <Wallet size={32} />
                  </div>
                  <p className="text-slate-500 font-medium">Nenhuma transação encontrada.</p>
                  <p className="text-sm text-slate-400">Comece adicionando seu primeiro gasto ou receita.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  <AnimatePresence mode="popLayout">
                    {transactions.map((t) => (
                      <motion.div
                        key={t.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            t.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                          )}>
                            {t.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">{t.description || t.category}</div>
                            <div className="text-xs text-slate-400 flex items-center gap-2">
                              <span>{t.category}</span>
                              <span>•</span>
                              <span>{format(parseISO(t.date), "dd 'de' MMMM", { locale: ptBR })}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "font-bold",
                            t.type === 'income' ? "text-emerald-600" : "text-rose-600"
                          )}>
                            {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                          </div>
                          <button
                            onClick={() => deleteTransaction(t.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Charts / Insights */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <PieChartIcon size={20} className="text-slate-400" />
              Gastos por Categoria
            </h2>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[350px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm italic">
                  Adicione despesas para ver o gráfico
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold">Nova Transação</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="flex p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => { setType('expense'); setCategory(''); }}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
                      type === 'expense' ? "bg-white text-rose-600 shadow-sm" : "text-slate-500"
                    )}
                  >
                    Despesa
                  </button>
                  <button
                    type="button"
                    onClick={() => { setType('income'); setCategory(''); }}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
                      type === 'income' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"
                    )}
                  >
                    Receita
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Valor</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">R$</span>
                    <input
                      required
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-bold text-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Categoria</label>
                    <select
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    >
                      <option value="">Selecionar</option>
                      {CATEGORIES[type].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Data</label>
                    <input
                      required
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Descrição (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Almoço no shopping"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className={cn(
                    "w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] mt-4",
                    type === 'income' ? "bg-emerald-500 shadow-emerald-200 hover:bg-emerald-600" : "bg-rose-500 shadow-rose-200 hover:bg-rose-600"
                  )}
                >
                  Salvar {type === 'income' ? 'Receita' : 'Despesa'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
