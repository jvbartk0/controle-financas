import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction } from '@/hooks/useTransactions';
import { format, parseISO, startOfMonth, eachDayOfInterval, endOfMonth, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BalanceChartProps {
  transactions: Transaction[];
}

export const BalanceChart = ({ transactions }: BalanceChartProps) => {
  const data = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    let runningBalance = 0;
    
    return days.map(day => {
      const dayTransactions = transactions.filter(t => 
        isSameDay(parseISO(t.date), day)
      );
      
      dayTransactions.forEach(t => {
        if (t.type === 'income') {
          runningBalance += Number(t.amount);
        } else {
          runningBalance -= Number(t.amount);
        }
      });
      
      return {
        date: format(day, 'dd', { locale: ptBR }),
        saldo: runningBalance,
      };
    });
  }, [transactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
    }).format(value);
  };

  if (transactions.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        Nenhuma transação registrada este mês
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="date" 
            className="text-xs fill-muted-foreground"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            className="text-xs fill-muted-foreground"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value: number) => [formatCurrency(value), 'Saldo']}
          />
          <Line
            type="monotone"
            dataKey="saldo"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
