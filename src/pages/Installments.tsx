import { Layout } from "@/components/Layout";
import { InstallmentsOverview } from "@/components/InstallmentsOverview";
import { useCreditCardTransactions } from "@/hooks/useCreditCardTransactions";
import { useCreditCardInvoices } from "@/hooks/useCreditCardInvoices";
import { useCreditCards } from "@/hooks/useCreditCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CreditCard, DollarSign, TrendingUp, Eye } from "lucide-react";
import { format, parseISO, addMonths, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

export default function Installments() {
  const { transactions } = useCreditCardTransactions();
  const { invoices } = useCreditCardInvoices();
  const { cards } = useCreditCards();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // Calculate upcoming installments per month
  const upcomingMonths = Array.from({ length: 6 }, (_, i) => {
    const date = addMonths(startOfMonth(new Date()), i);
    return format(date, "yyyy-MM-dd");
  });

  const getInstallmentsForMonth = (monthStr: string) => {
    return transactions.filter(t => {
      if (!t.is_installment) return false;
      // Find the invoice this transaction belongs to
      const invoice = invoices.find(inv => inv.id === t.invoice_id);
      return invoice?.reference_month === monthStr;
    });
  };

  const getMonthTotal = (monthStr: string) => {
    return getInstallmentsForMonth(monthStr).reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const getCard = (cardId: string) => cards.find(c => c.id === cardId);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Parcelamentos</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total em Parcelas Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                R$ {transactions
                  .filter(t => t.is_installment)
                  .reduce((sum, t) => sum + Number(t.amount), 0)
                  .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Próximo Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                R$ {getMonthTotal(upcomingMonths[1]).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Compras Parceladas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {new Set(transactions.filter(t => t.is_installment).map(t => t.description)).size}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              Por Mês
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <InstallmentsOverview />
          </TabsContent>

          <TabsContent value="calendar" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Parcelas por Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingMonths.map(monthStr => {
                    const monthInstallments = getInstallmentsForMonth(monthStr);
                    const total = getMonthTotal(monthStr);
                    const isSelected = selectedMonth === monthStr;

                    return (
                      <div
                        key={monthStr}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-secondary/50'
                        }`}
                        onClick={() => setSelectedMonth(isSelected ? null : monthStr)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium capitalize">
                            {format(parseISO(monthStr), "MMMM yyyy", { locale: ptBR })}
                          </h4>
                          <Badge variant="secondary">
                            {monthInstallments.length} parcelas
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold text-primary">
                          R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {selectedMonth && (
                  <div className="mt-6 space-y-2">
                    <h4 className="font-medium">
                      Parcelas de {format(parseISO(selectedMonth), "MMMM yyyy", { locale: ptBR })}
                    </h4>
                    <div className="space-y-2">
                      {getInstallmentsForMonth(selectedMonth).map(t => {
                        const card = getCard(t.card_id);
                        return (
                          <div
                            key={t.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                          >
                            <div className="flex items-center gap-3">
                              <CreditCard className="h-4 w-4" style={{ color: card?.color || '#6366f1' }} />
                              <div>
                                <p className="font-medium">{t.description}</p>
                                <p className="text-sm text-muted-foreground">
                                  {card?.name} • Parcela {t.installment_number}/{t.total_installments}
                                </p>
                              </div>
                            </div>
                            <p className="font-bold">
                              R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
