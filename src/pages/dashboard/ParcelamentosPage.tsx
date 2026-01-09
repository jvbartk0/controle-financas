import { useState } from "react";
import { format, addMonths } from "date-fns";
import { CalendarDays, CreditCard, Check, Clock, AlertTriangle } from "lucide-react";
import { useInstallments } from "@/hooks/useInstallments";
import { useCardPurchases } from "@/hooks/useCardPurchases";
import { useAccountContext } from "@/contexts/AccountContext";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formatCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const ParcelamentosPage = () => {
  const { selectedAccount } = useAccountContext();
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("active");

  const { data: installments, isLoading: installmentsLoading } = useInstallments();
  const { data: cardPurchases, isLoading: purchasesLoading } = useCardPurchases();

  // Filter installment purchases from cards
  const installmentPurchases = cardPurchases?.filter((p) => p.is_installment && p.installment_count > 1) || [];

  // Combine installments with card purchases
  const allInstallments = [
    ...(installments?.map((i) => ({
      id: i.id,
      description: i.description,
      origin: i.credit_card?.name || "Parcelamento direto",
      hasCard: !!i.credit_card_id,
      totalAmount: Number(i.total_amount),
      totalInstallments: i.total_installments,
      currentInstallment: i.current_installment,
      installmentValue: Number(i.total_amount) / i.total_installments,
      startDate: i.start_date,
      isCompleted: i.current_installment > i.total_installments,
    })) || []),
    ...installmentPurchases.map((p) => ({
      id: `purchase-${p.id}`,
      description: p.description,
      origin: "Cartão de crédito",
      hasCard: true,
      totalAmount: Number(p.amount),
      totalInstallments: p.installment_count,
      currentInstallment: 1, // Card purchases start at 1
      installmentValue: Number(p.installment_value || p.amount / p.installment_count),
      startDate: p.purchase_date,
      isCompleted: false,
    })),
  ];

  // Filter by status
  const filteredInstallments = allInstallments.filter((i) => {
    if (statusFilter === "active") return !i.isCompleted && i.currentInstallment <= i.totalInstallments;
    if (statusFilter === "completed") return i.isCompleted || i.currentInstallment > i.totalInstallments;
    return true;
  });

  // Calculate totals
  const totalMonthly = filteredInstallments
    .filter((i) => !i.isCompleted)
    .reduce((sum, i) => sum + i.installmentValue, 0);

  const totalRemaining = filteredInstallments
    .filter((i) => !i.isCompleted)
    .reduce((sum, i) => sum + (i.installmentValue * (i.totalInstallments - i.currentInstallment + 1)), 0);

  const totalPaid = filteredInstallments.reduce((sum, i) => {
    const paidInstallments = Math.max(0, i.currentInstallment - 1);
    return sum + (paidInstallments * i.installmentValue);
  }, 0);

  const isLoading = installmentsLoading || purchasesLoading;

  if (isLoading) return <LoadingState message="Carregando parcelamentos..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parcelamentos"
        description="Acompanhe suas compras parceladas"
        icon={CalendarDays}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Mensal</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(totalMonthly)}</p>
          <p className="text-xs text-muted-foreground mt-1">Comprometido por mês</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-muted-foreground mb-1">Já Pago</p>
          <p className="text-2xl font-bold text-emerald-500">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-muted-foreground mb-1">Falta Pagar</p>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(totalRemaining)}</p>
        </div>
      </div>

      {/* Tabs for filtering */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | "active" | "completed")}>
        <TabsList>
          <TabsTrigger value="active">Ativos</TabsTrigger>
          <TabsTrigger value="completed">Concluídos</TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Installments List */}
      {filteredInstallments.length > 0 ? (
        <div className="glass-card divide-y divide-border">
          {filteredInstallments.map((installment) => {
            const progress = (installment.currentInstallment / installment.totalInstallments) * 100;
            const remainingInstallments = installment.totalInstallments - installment.currentInstallment + 1;
            const amountPaid = (installment.currentInstallment - 1) * installment.installmentValue;
            const amountRemaining = remainingInstallments * installment.installmentValue;

            // Calculate next payment date (approximate)
            const startDate = new Date(installment.startDate);
            const nextPaymentDate = addMonths(startDate, installment.currentInstallment - 1);

            return (
              <div key={installment.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{installment.description}</h3>
                      {installment.isCompleted && (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-500 rounded text-xs flex items-center gap-1">
                          <Check className="w-3 h-3" /> Concluído
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      {installment.hasCard && <CreditCard className="w-3 h-3" />}
                      <span>{installment.origin}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(installment.installmentValue)}/mês</p>
                    <p className="text-sm text-muted-foreground">Total: {formatCurrency(installment.totalAmount)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Parcela Atual</p>
                    <p className="font-medium">{installment.currentInstallment} de {installment.totalInstallments}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Parcelas Restantes</p>
                    <p className="font-medium">{Math.max(0, remainingInstallments)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Já Pago</p>
                    <p className="font-medium text-emerald-500">{formatCurrency(amountPaid)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Falta Pagar</p>
                    <p className="font-medium text-red-500">{formatCurrency(Math.max(0, amountRemaining))}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Progress value={Math.min(100, progress)} className="flex-1" />
                  <span className="text-sm font-medium w-12 text-right">{Math.min(100, progress).toFixed(0)}%</span>
                </div>

                {!installment.isCompleted && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Próximo pagamento: {format(nextPaymentDate, "dd/MM/yyyy")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card">
          <EmptyState
            icon={CalendarDays}
            title="Nenhum parcelamento"
            description={
              statusFilter === "active"
                ? "Você não tem parcelamentos ativos. Adicione compras parceladas na página de Cartões."
                : "Nenhum parcelamento encontrado."
            }
          />
        </div>
      )}
    </div>
  );
};

export default ParcelamentosPage;
