import { useState } from "react";
import { format } from "date-fns";
import { CreditCard, Plus, Edit, Trash2, ShoppingCart, Eye, ChevronLeft, Receipt } from "lucide-react";
import { useCreditCards, useCreateCreditCard, useDeleteCreditCard, CreditCard as CreditCardType } from "@/hooks/useCreditCards";
import { useCardPurchases, useCreateCardPurchase, useDeleteCardPurchase } from "@/hooks/useCardPurchases";
import { useCategories } from "@/hooks/useCategories";
import { useAccountContext } from "@/contexts/AccountContext";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const formatCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const CartoesPage = () => {
  const { selectedAccount } = useAccountContext();
  const [selectedCard, setSelectedCard] = useState<CreditCardType | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [deletePurchaseId, setDeletePurchaseId] = useState<string | null>(null);

  const [cardForm, setCardForm] = useState({ name: "", card_limit: "", closing_day: "15", due_day: "5", color: "#10b981" });
  const [purchaseForm, setPurchaseForm] = useState({
    description: "",
    amount: "",
    purchase_date: format(new Date(), "yyyy-MM-dd"),
    category_id: "",
    is_installment: false,
    installment_count: "1",
    installment_value: "",
  });

  const { data: cards, isLoading: cardsLoading } = useCreditCards();
  const { data: purchases, isLoading: purchasesLoading } = useCardPurchases(selectedCard?.id);
  const { data: categories } = useCategories("expense");
  const createCard = useCreateCreditCard();
  const deleteCard = useDeleteCreditCard();
  const createPurchase = useCreateCardPurchase();
  const deletePurchase = useDeleteCardPurchase();

  // Calculate used limit from purchases
  const usedLimit = purchases?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const availableLimit = selectedCard ? Number(selectedCard.card_limit) - usedLimit : 0;
  const usagePercent = selectedCard ? (usedLimit / Number(selectedCard.card_limit)) * 100 : 0;

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardForm.name || !cardForm.card_limit) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    try {
      await createCard.mutateAsync({
        name: cardForm.name,
        card_limit: parseFloat(cardForm.card_limit),
        closing_day: parseInt(cardForm.closing_day) || 15,
        due_day: parseInt(cardForm.due_day) || 5,
        color: cardForm.color,
        account_id: selectedAccount?.id,
      });
      toast.success("Cartão criado");
      setIsCardModalOpen(false);
      setCardForm({ name: "", card_limit: "", closing_day: "15", due_day: "5", color: "#10b981" });
    } catch {
      toast.error("Erro ao criar cartão");
    }
  };

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard || !purchaseForm.description || !purchaseForm.amount) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const amount = parseFloat(purchaseForm.amount);
    const installmentCount = parseInt(purchaseForm.installment_count) || 1;
    const installmentValue = purchaseForm.is_installment
      ? purchaseForm.installment_value
        ? parseFloat(purchaseForm.installment_value)
        : amount / installmentCount
      : amount;

    try {
      await createPurchase.mutateAsync({
        credit_card_id: selectedCard.id,
        account_id: selectedAccount?.id,
        description: purchaseForm.description,
        amount,
        purchase_date: purchaseForm.purchase_date,
        category_id: purchaseForm.category_id || null,
        is_installment: purchaseForm.is_installment,
        installment_count: installmentCount,
        installment_value: installmentValue,
      });
      toast.success("Compra adicionada");
      setIsPurchaseModalOpen(false);
      setPurchaseForm({
        description: "",
        amount: "",
        purchase_date: format(new Date(), "yyyy-MM-dd"),
        category_id: "",
        is_installment: false,
        installment_count: "1",
        installment_value: "",
      });
    } catch {
      toast.error("Erro ao adicionar compra");
    }
  };

  const handleDeleteCard = async () => {
    if (!deleteCardId) return;
    try {
      await deleteCard.mutateAsync(deleteCardId);
      toast.success("Cartão excluído");
      if (selectedCard?.id === deleteCardId) setSelectedCard(null);
    } catch {
      toast.error("Erro ao excluir");
    }
    setDeleteCardId(null);
  };

  const handleDeletePurchase = async () => {
    if (!deletePurchaseId) return;
    try {
      await deletePurchase.mutateAsync(deletePurchaseId);
      toast.success("Compra excluída");
    } catch {
      toast.error("Erro ao excluir");
    }
    setDeletePurchaseId(null);
  };

  if (cardsLoading) return <LoadingState message="Carregando cartões..." />;

  // Card detail view
  if (selectedCard) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setSelectedCard(null)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{selectedCard.name}</h2>
            <p className="text-muted-foreground">Fecha dia {selectedCard.closing_day} • Vence dia {selectedCard.due_day}</p>
          </div>
        </div>

        {/* Card Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-6">
            <p className="text-sm text-muted-foreground mb-1">Limite Total</p>
            <p className="text-2xl font-bold">{formatCurrency(Number(selectedCard.card_limit))}</p>
          </div>
          <div className="glass-card p-6">
            <p className="text-sm text-muted-foreground mb-1">Limite Disponível</p>
            <p className="text-2xl font-bold text-emerald-500">{formatCurrency(availableLimit)}</p>
          </div>
          <div className="glass-card p-6">
            <p className="text-sm text-muted-foreground mb-1">Fatura Atual</p>
            <p className="text-2xl font-bold text-red-500">{formatCurrency(usedLimit)}</p>
          </div>
        </div>

        {/* Usage Progress */}
        <div className="glass-card p-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Utilização do limite</span>
            <span className="text-sm font-medium">{usagePercent.toFixed(1)}%</span>
          </div>
          <Progress value={usagePercent} className="h-2" />
        </div>

        {/* Purchases Section */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Compras do Cartão
            </h3>
            <Button size="sm" onClick={() => setIsPurchaseModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Compra
            </Button>
          </div>

          {purchasesLoading ? (
            <LoadingState message="Carregando compras..." />
          ) : purchases && purchases.length > 0 ? (
            <div className="divide-y divide-border">
              {purchases.map((purchase) => (
                <div key={purchase.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{purchase.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{format(new Date(purchase.purchase_date), "dd/MM/yyyy")}</span>
                      {purchase.is_installment && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-500 rounded text-xs">
                          {purchase.installment_count}x de {formatCurrency(Number(purchase.installment_value))}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">{formatCurrency(Number(purchase.amount))}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeletePurchaseId(purchase.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ShoppingCart}
              title="Nenhuma compra"
              description="Adicione compras feitas neste cartão"
              actionLabel="Adicionar Compra"
              onAction={() => setIsPurchaseModalOpen(true)}
            />
          )}
        </div>

        {/* Purchase Modal */}
        <Dialog open={isPurchaseModalOpen} onOpenChange={setIsPurchaseModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Compra</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePurchase} className="space-y-4">
              <div>
                <Label>Descrição *</Label>
                <Input
                  placeholder="Ex: Restaurante, Farmácia..."
                  value={purchaseForm.description}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Valor Total *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={purchaseForm.amount}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={purchaseForm.purchase_date}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, purchase_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Categoria</Label>
                <Select
                  value={purchaseForm.category_id}
                  onValueChange={(v) => setPurchaseForm({ ...purchaseForm, category_id: v })}
                >
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
              <div className="flex items-center gap-3">
                <Switch
                  checked={purchaseForm.is_installment}
                  onCheckedChange={(v) => setPurchaseForm({ ...purchaseForm, is_installment: v })}
                />
                <Label>Compra parcelada</Label>
              </div>
              {purchaseForm.is_installment && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nº de Parcelas</Label>
                    <Input
                      type="number"
                      min="2"
                      max="48"
                      value={purchaseForm.installment_count}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, installment_count: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Valor da Parcela</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Auto"
                      value={purchaseForm.installment_value}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, installment_value: e.target.value })}
                    />
                    {purchaseForm.amount && !purchaseForm.installment_value && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ≈ {formatCurrency(parseFloat(purchaseForm.amount) / (parseInt(purchaseForm.installment_count) || 1))}/mês
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsPurchaseModalOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createPurchase.isPending}>
                  {createPurchase.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Purchase Confirmation */}
        <AlertDialog open={!!deletePurchaseId} onOpenChange={() => setDeletePurchaseId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir compra?</AlertDialogTitle>
              <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeletePurchase} className="bg-destructive text-destructive-foreground">Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Cards list view
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cartões de Crédito"
        description="Gerencie seus cartões e faturas"
        icon={CreditCard}
        actionLabel="Novo Cartão"
        actionIcon={Plus}
        onAction={() => setIsCardModalOpen(true)}
      />

      {cards && cards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className="glass-card p-6 cursor-pointer hover:border-primary/50 transition-colors"
              style={{ borderLeftColor: card.color || "#10b981", borderLeftWidth: "4px" }}
              onClick={() => setSelectedCard(card)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{card.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Fecha dia {card.closing_day} • Vence dia {card.due_day}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setSelectedCard(card); }}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteCardId(card.id); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Limite</span>
                  <span className="font-semibold">{formatCurrency(Number(card.card_limit))}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card">
          <EmptyState
            icon={CreditCard}
            title="Nenhum cartão cadastrado"
            description="Adicione seu primeiro cartão de crédito para começar a controlar suas faturas."
            actionLabel="Adicionar Cartão"
            onAction={() => setIsCardModalOpen(true)}
          />
        </div>
      )}

      {/* Card Modal */}
      <Dialog open={isCardModalOpen} onOpenChange={setIsCardModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Cartão</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCard} className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input placeholder="Nubank, Itaú..." value={cardForm.name} onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })} required />
            </div>
            <div>
              <Label>Limite *</Label>
              <Input type="number" step="0.01" value={cardForm.card_limit} onChange={(e) => setCardForm({ ...cardForm, card_limit: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Dia Fechamento</Label>
                <Input type="number" min="1" max="31" value={cardForm.closing_day} onChange={(e) => setCardForm({ ...cardForm, closing_day: e.target.value })} />
              </div>
              <div>
                <Label>Dia Vencimento</Label>
                <Input type="number" min="1" max="31" value={cardForm.due_day} onChange={(e) => setCardForm({ ...cardForm, due_day: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Cor</Label>
              <Input type="color" value={cardForm.color} onChange={(e) => setCardForm({ ...cardForm, color: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCardModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createCard.isPending}>{createCard.isPending ? "Salvando..." : "Salvar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Card Confirmation */}
      <AlertDialog open={!!deleteCardId} onOpenChange={() => setDeleteCardId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cartão?</AlertDialogTitle>
            <AlertDialogDescription>Todas as compras deste cartão também serão excluídas. Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCard} className="bg-destructive text-destructive-foreground">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CartoesPage;
