import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccountContext } from "@/contexts/AccountContext";
import { useTransactions, useTransactionStats } from "@/hooks/useTransactions";
import { useFixedBills } from "@/hooks/useFixedBills";
import { useInstallments } from "@/hooks/useInstallments";
import { MonthSelector } from "@/components/shared/MonthSelector";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const DashboardHome = () => {
  const { selectedAccount, isLoading: accountLoading } = useAccountContext();
  const [showBalance, setShowBalance] = useState(true);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
  const endDate = new Date(year, month, 0).toISOString().split("T")[0];

  const { data: transactions, isLoading: transLoading } = useTransactions({
    startDate,
    endDate,
    accountId: selectedAccount?.id,
    limit: 10,
  });

  const { data: stats } = useTransactionStats(month, year);
  const { data: fixedBills } = useFixedBills(selectedAccount?.id);
  const { data: installments } = useInstallments("active");

  // Calculate category breakdown for pie chart
  const categoryData = useMemo(() => {
    if (!transactions) return [];
    const expensesByCategory: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const name = t.category?.name || "Outros";
        expensesByCategory[name] = (expensesByCategory[name] || 0) + Number(t.amount);
      });
    return Object.entries(expensesByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [transactions]);

  // Weekly breakdown for bar chart
  const weeklyData = useMemo(() => {
    if (!transactions) return [];
    const weeks: Record<string, { income: number; expense: number }> = {};
    transactions.forEach((t) => {
      const date = new Date(t.date);
      const weekNum = Math.ceil(date.getDate() / 7);
      const key = `Sem ${weekNum}`;
      if (!weeks[key]) weeks[key] = { income: 0, expense: 0 };
      if (t.type === "income") {
        weeks[key].income += Number(t.amount);
      } else {
        weeks[key].expense += Number(t.amount);
      }
    });
    return Object.entries(weeks).map(([name, data]) => ({ name, ...data }));
  }, [transactions]);

  // Upcoming alerts
  const upcomingBills = useMemo(() => {
    if (!fixedBills) return [];
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return fixedBills
      .filter((b) => !b.is_paid && new Date(b.next_due_date) <= nextWeek)
      .slice(0, 3);
  }, [fixedBills]);

  const upcomingInstallments = useMemo(() => {
    if (!installments) return [];
    return installments.filter((i) => i.current_installment <= i.total_installments).slice(0, 3);
  }, [installments]);

  if (accountLoading || transLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const accountBalance = selectedAccount?.balance || 0;
  const monthResult = (stats?.income || 0) - (stats?.expense || 0);

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <div className="flex justify-end">
        <MonthSelector month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Saldo da Conta</span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-muted-foreground hover:text-foreground"
            >
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
          <div className="text-2xl font-bold">
            {showBalance ? formatCurrency(accountBalance) : "••••••"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{selectedAccount?.name}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-muted-foreground">Entradas</span>
          </div>
          <div className="text-2xl font-bold text-emerald-500">
            {showBalance ? formatCurrency(stats?.income || 0) : "••••••"}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <span className="text-sm text-muted-foreground">Saídas</span>
          </div>
          <div className="text-2xl font-bold text-red-500">
            {showBalance ? formatCurrency(stats?.expense || 0) : "••••••"}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="text-sm text-muted-foreground mb-2">Resultado do Mês</div>
          <div className={`text-2xl font-bold ${monthResult >= 0 ? "text-emerald-500" : "text-red-500"}`}>
            {showBalance ? formatCurrency(monthResult) : "••••••"}
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Receitas vs Despesas</h3>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `R$${v}`} />
                <Tooltip
                  formatter={(v: number) => formatCurrency(v)}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                />
                <Bar dataKey="income" fill="#10b981" name="Entradas" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" name="Saídas" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>Sem dados no período</p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Gastos por Categoria</h3>
          {categoryData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {categoryData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="truncate max-w-[100px]">{item.name}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>Sem despesas no período</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Alerts */}
      {(upcomingBills.length > 0 || upcomingInstallments.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Alertas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingBills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <div>
                  <p className="font-medium">{bill.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Vence em {format(new Date(bill.next_due_date), "dd/MM", { locale: ptBR })}
                  </p>
                </div>
                <span className="font-semibold text-amber-500">{formatCurrency(bill.amount)}</span>
              </div>
            ))}
            {upcomingInstallments.map((inst) => (
              <div key={inst.id} className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div>
                  <p className="font-medium">{inst.description}</p>
                  <p className="text-sm text-muted-foreground">
                    Parcela {inst.current_installment}/{inst.total_installments}
                  </p>
                </div>
                <span className="font-semibold text-blue-500">
                  {formatCurrency(Number(inst.total_amount) / inst.total_installments)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Últimas Transações</h3>
          <Link to="/dashboard/transacoes">
            <Button variant="ghost" size="sm" className="gap-1">
              Ver todas <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        {transactions && transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.slice(0, 10).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === "income"
                        ? "bg-emerald-500/20 text-emerald-500"
                        : "bg-red-500/20 text-red-500"
                    }`}
                  >
                    {transaction.type === "income" ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.date), "dd/MM/yyyy")} • {transaction.category?.name || "Sem categoria"}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-semibold ${
                    transaction.type === "income" ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  {showBalance
                    ? `${transaction.type === "income" ? "+" : "-"}${formatCurrency(Number(transaction.amount))}`
                    : "••••••"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma transação registrada.</p>
            <Link to="/dashboard/transacoes">
              <Button size="sm" className="mt-4">
                Ir para Transações
              </Button>
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DashboardHome;
