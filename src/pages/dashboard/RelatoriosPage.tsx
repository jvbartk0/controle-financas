import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart3, Download, FileText, FileJson, Loader2 } from "lucide-react";
import { useTransactions, useTransactionStats } from "@/hooks/useTransactions";
import { useAccountContext } from "@/contexts/AccountContext";
import { LoadingState } from "@/components/shared/LoadingState";
import { PageHeader } from "@/components/shared/PageHeader";
import { MonthSelector } from "@/components/shared/MonthSelector";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { toast } from "sonner";

const formatCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

type ReportType = "summary" | "transactions" | "categories";

const RelatoriosPage = () => {
  const { selectedAccount } = useAccountContext();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [reportType, setReportType] = useState<ReportType>("summary");
  const [isExporting, setIsExporting] = useState(false);

  const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
  const endDate = new Date(year, month, 0).toISOString().split("T")[0];

  const { data: stats, isLoading: statsLoading } = useTransactionStats(month, year);
  const { data: transactions, isLoading: transLoading } = useTransactions({ startDate, endDate, accountId: selectedAccount?.id });

  // Category data for charts
  const categoryData = transactions
    ?.filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      const name = t.category?.name || "Outros";
      acc[name] = (acc[name] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryData || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Daily breakdown for line chart
  const dailyData = transactions?.reduce((acc, t) => {
    const day = format(new Date(t.date), "dd");
    if (!acc[day]) acc[day] = { day, income: 0, expense: 0 };
    if (t.type === "income") {
      acc[day].income += Number(t.amount);
    } else {
      acc[day].expense += Number(t.amount);
    }
    return acc;
  }, {} as Record<string, { day: string; income: number; expense: number }>);

  const dailyChartData = Object.values(dailyData || {}).sort((a, b) => parseInt(a.day) - parseInt(b.day));

  // Top expenses
  const topExpenses = transactions
    ?.filter((t) => t.type === "expense")
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 10);

  const exportToCSV = () => {
    if (!transactions || transactions.length === 0) {
      toast.error("Sem dados para exportar");
      return;
    }

    setIsExporting(true);

    try {
      const headers = ["Data", "Descrição", "Categoria", "Tipo", "Valor"];
      const rows = transactions.map((t) => [
        format(new Date(t.date), "dd/MM/yyyy"),
        t.description,
        t.category?.name || "Sem categoria",
        t.type === "income" ? "Entrada" : "Saída",
        Number(t.amount).toFixed(2),
      ]);

      const csvContent = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio_${month}_${year}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Relatório exportado com sucesso");
    } catch {
      toast.error("Erro ao exportar relatório");
    }

    setIsExporting(false);
  };

  const exportToJSON = () => {
    if (!transactions || transactions.length === 0) {
      toast.error("Sem dados para exportar");
      return;
    }

    setIsExporting(true);

    try {
      const data = {
        period: { month, year },
        account: selectedAccount?.name,
        summary: stats,
        transactions: transactions.map((t) => ({
          date: t.date,
          description: t.description,
          category: t.category?.name || null,
          type: t.type,
          amount: Number(t.amount),
        })),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio_${month}_${year}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Relatório exportado com sucesso");
    } catch {
      toast.error("Erro ao exportar relatório");
    }

    setIsExporting(false);
  };

  const isLoading = statsLoading || transLoading;

  if (isLoading) return <LoadingState message="Carregando relatórios..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="Relatórios" description="Análise detalhada das suas finanças" icon={BarChart3} />
        <div className="flex items-center gap-2">
          <MonthSelector month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Label>Tipo de Relatório:</Label>
            <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Resumo Mensal</SelectItem>
                <SelectItem value="transactions">Detalhado de Transações</SelectItem>
                <SelectItem value="categories">Por Categoria</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV} disabled={isExporting}>
              {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
              Exportar CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportToJSON} disabled={isExporting}>
              {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileJson className="w-4 h-4 mr-2" />}
              Exportar JSON
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Entradas" value={formatCurrency(stats?.income || 0)} valueClassName="text-emerald-500" />
        <StatCard title="Total Saídas" value={formatCurrency(stats?.expense || 0)} valueClassName="text-red-500" />
        <StatCard title="Saldo do Período" value={formatCurrency(stats?.balance || 0)} valueClassName={(stats?.balance || 0) >= 0 ? "text-emerald-500" : "text-red-500"} />
        <StatCard title="Transações" value={String(transactions?.length || 0)} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Daily Chart */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Evolução Diária</h3>
            {dailyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `R$${v}`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="income" stroke="#10b981" name="Entradas" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="expense" stroke="#ef4444" name="Saídas" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">Sem dados no período</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Distribuição por Categoria</h3>
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {categoryChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">Sem despesas no período</p>
              )}
            </div>

            {/* Bar Chart */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Gastos por Categoria</h3>
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis type="category" dataKey="name" width={100} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">Sem dados para exibir</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ranking" className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Maiores Despesas do Período</h3>
            {topExpenses && topExpenses.length > 0 ? (
              <div className="divide-y divide-border">
                {topExpenses.map((t, index) => (
                  <div key={t.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-muted-foreground w-8">{index + 1}</span>
                      <div>
                        <p className="font-medium">{t.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(t.date), "dd/MM/yyyy")} • {t.category?.name || "Sem categoria"}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-red-500">{formatCurrency(Number(t.amount))}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Sem despesas no período</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RelatoriosPage;
