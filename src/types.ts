export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description: string;
}

export const CATEGORIES = {
  expense: [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Lazer',
    'Saúde',
    'Educação',
    'Compras',
    'Outros'
  ],
  income: [
    'Salário',
    'Investimentos',
    'Freelance',
    'Presente',
    'Outros'
  ]
};
