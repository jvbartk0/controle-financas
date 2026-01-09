import { useState } from "react";
import { format, addMonths, addWeeks, addYears, isBefore, isToday, addDays } from "date-fns";
import { Repeat, Plus, Edit, Trash2, Check, Clock, AlertTriangle } from "lucide-react";
import { useFixedBills, useCreateFixedBill, useDeleteFixedBill, useMarkBillAsPaid, FixedBill } from "@/hooks/useFixedBills";
import { useCategories } from "@/hooks/useCategories";
import { useAccountContext } from "@/contexts/AccountContext";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const formatCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const frequencyLabels: Record<string, string> = {
  monthly: "Mensal",
  weekly: "Semanal",
  yearly: "Anual",
};

const importanceColors: Record<string, string> = {
  high: "text-red-500 bg-red-500/10 border-red-500/20",
  normal: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  low: "text-muted-foreground bg-muted/50 border-muted",
};

const ContasFixasPage = () => {
  const { selectedAccount } = useAccountContext();
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "overdue">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [payingBillId, setPayingBillId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category_id: "",
    due_day: format(new Date(), "d"),
    frequency: "monthly",
    importance: "normal",
    next_due_date: format(new Date(), "yyyy-MM-dd"),
  });

  const { data: bills, isLoading } = useFixedBills(selectedAccount?.id);
  const { data: categories } = useCategories("expense");
  const createBill = useCreateFixedBill();
  const deleteBill = useDeleteFixedBill();
  const markAsPaid = useMarkBillAsPaid();

  // Filter bills
  const today = new Date();
  const filteredBills = bills?.filter((bill) => {
    const dueDate = new Date(bill.next_due_date);
    if (statusFilter === "pending") return !bill.is_paid && !isBefore(dueDate, today);
    if (statusFilter === "overdue") return !bill.is_paid && isBefore(dueDate, today);
    return true;
  }) || [];

  // Separate by status
  const overdueBills = filteredBills.filter((b) => !b.is_paid && isBefore(new Date(b.next_due_date), today));
  const upcomingBills = filteredBills.filter((b) => {
    const dueDate = new Date(b.next_due_date);
    return !b.is_paid && !isBefore(dueDate, today) && isBefore(dueDate, addDays(today, 7));
  });

  // Calculate totals
  const totalMonthly = bills?.filter((b) => b.frequency === "monthly").reduce((sum, b) => sum + Number(b.amount), 0) || 0;

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    try {
      await createBill.mutateAsync({
        account_id: selectedAccount?.id,
        name: formData.name,
        amount: parseFloat(formData.amount),
        category_id: formData.category_id || null,
        due_day: parseInt(formData.due_day) || 1,
        frequency: formData.frequency,
        next_due_date: formData.next_due_date,
        importance: formData.importance,
      });
      toast.success("Conta fixa adicionada");
      setIsModalOpen(false);
      setFormData({
        name: "",
        amount: "",
        category_id: "",
        due_day: format(new Date(), "d"),
        frequency: "monthly",
        importance: "normal",
        next_due_date: format(new Date(), "yyyy-MM-dd"),
      });
    } catch {
      toast.error("Erro ao criar conta fixa");
    }
  };

  const handleDeleteBill = async () => {
    if (!deleteId) return;
    try {
      await deleteBill.mutateAsync(deleteId);
      toast.success("Conta fixa excluída");
    } catch {
      toast.error("Erro ao excluir");
    }
    setDeleteId(null);
  };

  const handleMarkAsPaid = async () => {
    if (!payingBillId) return;
    try {
      await markAsPaid.mutateAsync({ billId: payingBillId, accountId: selectedAccount?.id });
      toast.success("Conta paga e transação registrada");
    } catch {
      toast.error("Erro ao registrar pagamento");
    }
    setPayingBillId(null);
  };

  const getBillStatus = (bill: FixedBill) => {
    const dueDate = new Date(bill.next_due_date);
    if (bill.is_paid) return { label: "Pago", icon: Check, className: "text-emerald-500" };
    if (isBefore(dueDate, today)) return { label: "Vencido", icon: AlertTriangle, className: "text-red-500" };
    if (isBefore(dueDate, addDays(today, 7))) return { label: "Próximo", icon: Clock, className: "text-amber-500" };
    return { label: "Agendado", icon: Clock, className: "text-muted-foreground" };
  };

  if (isLoading) return <LoadingState message="Carregando contas fixas..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contas Fixas"
        description="Gerencie suas despesas recorrentes"
        icon={Repeat}
        actionLabel="Adicionar Conta Fixa"
        actionIcon={Plus}
        onAction={() => setIsModalOpen(true)}
      />

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Mensal</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(totalMonthly)}</p>
        </div>
        {overdueBills.length > 0 && (
          <div className="glass-card p-6 border-red-500/30">
            <p className="text-sm text-red-500 mb-1">Vencidas</p>
            <p className="text-2xl font-bold text-red-500">{overdueBills.length}</p>
          </div>
        )}
        {upcomingBills.length > 0 && (
          <div className="glass-card p-6 border-amber-500/30">
            <p className="text-sm text-amber-500 mb-1">Próximas (7 dias)</p>
            <p className="text-2xl font-bold text-amber-500">{upcomingBills.length}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | "pending" | "overdue")}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="overdue">Vencidas</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Bills List */}
      {filteredBills.length > 0 ? (
        <div className="glass-card divide-y divide-border">
          {filteredBills.map((bill) => {
            const status = getBillStatus(bill);
            return (
              <div key={bill.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${importanceColors[bill.importance || "normal"]}`}>
                    <Repeat className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{bill.name}</h3>
                      <span className={`text-xs flex items-center gap-1 ${status.className}`}>
                        <status.icon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{frequencyLabels[bill.frequency] || bill.frequency}</span>
                      <span>•</span>
                      <span>Vence {format(new Date(bill.next_due_date), "dd/MM/yyyy")}</span>
                      {bill.category?.name && (
                        <>
                          <span>•</span>
                          <span>{bill.category.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-red-500">{formatCurrency(bill.amount)}</span>
                  <div className="flex gap-1">
                    {!bill.is_paid && (
                      <Button variant="outline" size="sm" onClick={() => setPayingBillId(bill.id)}>
                        <Check className="w-4 h-4 mr-1" />
                        Pagar
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(bill.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card">
          <EmptyState
            icon={Repeat}
            title="Nenhuma conta fixa"
            description="Adicione suas despesas recorrentes como aluguel, internet, streaming, etc."
            actionLabel="Adicionar Conta Fixa"
            onAction={() => setIsModalOpen(true)}
          />
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Conta Fixa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateBill} className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input
                placeholder="Ex: Aluguel, Internet, Netflix..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Frequência</Label>
                <Select value={formData.frequency} onValueChange={(v) => setFormData({ ...formData, frequency: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Próximo Vencimento</Label>
                <Input
                  type="date"
                  value={formData.next_due_date}
                  onChange={(e) => setFormData({ ...formData, next_due_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Importância</Label>
                <Select value={formData.importance} onValueChange={(v) => setFormData({ ...formData, importance: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={formData.category_id} onValueChange={(v) => setFormData({ ...formData, category_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createBill.isPending}>
                {createBill.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta fixa?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBill} className="bg-destructive text-destructive-foreground">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pay Confirmation */}
      <AlertDialog open={!!payingBillId} onOpenChange={() => setPayingBillId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar como pago?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso irá criar uma transação de despesa e atualizar a data do próximo vencimento automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAsPaid}>Confirmar Pagamento</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContasFixasPage;
