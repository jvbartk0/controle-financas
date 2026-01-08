import { useCreditCardTransactions } from '@/hooks/useCreditCardTransactions';
import { useCreditCards } from '@/hooks/useCreditCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CreditCard, Calendar, DollarSign } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InstallmentGroup {
  description: string;
  totalAmount: number;
  installmentAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  purchaseDate: string;
  cardId: string;
}

export const InstallmentsOverview = () => {
  const { transactions, isLoading } = useCreditCardTransactions();
  const { cards } = useCreditCards();

  // Group installments by parent transaction or by description + purchase date
  const installmentGroups: InstallmentGroup[] = [];
  const processedIds = new Set<string>();

  transactions
    .filter(t => t.is_installment && t.total_installments && t.total_installments > 1)
    .forEach(transaction => {
      if (processedIds.has(transaction.id)) return;

      // Find all related installments
      const relatedTransactions = transactions.filter(t => 
        t.description === transaction.description &&
        t.purchase_date === transaction.purchase_date &&
        t.is_installment
      ).sort((a, b) => (a.installment_number || 0) - (b.installment_number || 0));

      relatedTransactions.forEach(t => processedIds.add(t.id));

      const totalInstallments = transaction.total_installments || 1;
      const paidInstallments = relatedTransactions.filter(t => {
        // Consider installment as paid if it's in a closed/paid invoice
        // For now, we'll count all past installments as "processed"
        return (t.installment_number || 0) <= Math.max(...relatedTransactions.map(r => r.installment_number || 0));
      }).length;

      installmentGroups.push({
        description: transaction.description,
        totalAmount: Number(transaction.amount) * totalInstallments,
        installmentAmount: Number(transaction.amount),
        totalInstallments,
        paidInstallments: Math.min(paidInstallments, totalInstallments),
        purchaseDate: transaction.purchase_date,
        cardId: transaction.card_id,
      });
    });

  const getCard = (cardId: string) => cards.find(c => c.id === cardId);

  const totalRemaining = installmentGroups.reduce((sum, group) => {
    const remaining = (group.totalInstallments - group.paidInstallments) * group.installmentAmount;
    return sum + remaining;
  }, 0);

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded" />;
  }

  if (installmentGroups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Parcelamentos Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nenhum parcelamento ativo no momento
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Parcelamentos Ativos
        </CardTitle>
        <Badge variant="secondary" className="text-sm">
          Total pendente: R$ {totalRemaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {installmentGroups.map((group, index) => {
          const card = getCard(group.cardId);
          const progressPercent = (group.paidInstallments / group.totalInstallments) * 100;
          const remaining = (group.totalInstallments - group.paidInstallments) * group.installmentAmount;
          
          return (
            <div key={index} className="p-4 rounded-lg border bg-card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium">{group.description}</h4>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    {card && (
                      <>
                        <CreditCard className="h-3 w-3" style={{ color: card.color || '#6366f1' }} />
                        <span>{card.name}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>Compra em {format(parseISO(group.purchaseDate), "dd/MM/yyyy")}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    R$ {group.installmentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    <span className="text-sm font-normal text-muted-foreground">/mês</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total: R$ {group.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {group.paidInstallments} de {group.totalInstallments} parcelas
                  </span>
                  <span className="font-medium">
                    Restam R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
