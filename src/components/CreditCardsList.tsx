import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, CreditCard, Pencil, Trash2, Eye } from "lucide-react";
import { useCreditCards, CreditCardInsert } from "@/hooks/useCreditCards";
import { useCreditCardInvoices } from "@/hooks/useCreditCardInvoices";
import { useCreditCardTransactions } from "@/hooks/useCreditCardTransactions";
import { format, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

const CARD_BRANDS = ["Visa", "Mastercard", "Elo", "American Express", "Hipercard", "Diners Club"];
const CARD_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316", 
  "#eab308", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6",
  "#1e293b", "#64748b"
];

export function CreditCardsList() {
  const { cards, isLoading, createCard, updateCard, deleteCard } = useCreditCards();
  const { invoices } = useCreditCardInvoices();
  const { transactions } = useCreditCardTransactions();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<typeof cards[0] | null>(null);
  
  const [formData, setFormData] = useState<CreditCardInsert>({
    name: "",
    bank: "",
    brand: "Visa",
    credit_limit: 0,
    closing_day: 1,
    due_day: 10,
    is_active: true,
    color: "#6366f1",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      bank: "",
      brand: "Visa",
      credit_limit: 0,
      closing_day: 1,
      due_day: 10,
      is_active: true,
      color: "#6366f1",
    });
    setEditingCard(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCard) {
      updateCard.mutate({ id: editingCard.id, ...formData });
    } else {
      createCard.mutate(formData);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (card: typeof cards[0]) => {
    setEditingCard(card);
    setFormData({
      name: card.name,
      bank: card.bank || "",
      brand: card.brand,
      credit_limit: card.credit_limit,
      closing_day: card.closing_day,
      due_day: card.due_day,
      is_active: card.is_active,
      color: card.color || "#6366f1",
    });
    setIsDialogOpen(true);
  };

  const calculateUsedLimit = (cardId: string) => {
    const currentMonth = format(startOfMonth(new Date()), "yyyy-MM-dd");
    const cardInvoices = invoices.filter(
      inv => inv.card_id === cardId && !inv.is_paid
    );
    return cardInvoices.reduce((sum, inv) => sum + (Number(inv.total_amount) - Number(inv.paid_amount)), 0);
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando cartões...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Meus Cartões</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Cartão
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCard ? "Editar Cartão" : "Novo Cartão"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Cartão *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Nubank Platinum"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank">Banco</Label>
                  <Input
                    id="bank"
                    value={formData.bank}
                    onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                    placeholder="Ex: Nubank"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Bandeira *</Label>
                  <Select
                    value={formData.brand}
                    onValueChange={(value) => setFormData({ ...formData, brand: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CARD_BRANDS.map(brand => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="limit">Limite Total (R$) *</Label>
                <Input
                  id="limit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.credit_limit || ""}
                  onChange={(e) => setFormData({ ...formData, credit_limit: parseFloat(e.target.value) || 0 })}
                  placeholder="5000.00"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="closing">Dia de Fechamento *</Label>
                  <Input
                    id="closing"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.closing_day}
                    onChange={(e) => setFormData({ ...formData, closing_day: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due">Dia de Vencimento *</Label>
                  <Input
                    id="due"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.due_day}
                    onChange={(e) => setFormData({ ...formData, due_day: parseInt(e.target.value) || 10 })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Cor do Cartão</Label>
                <div className="flex gap-2 flex-wrap">
                  {CARD_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full transition-all ${
                        formData.color === color ? "ring-2 ring-offset-2 ring-primary scale-110" : ""
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="active">Cartão Ativo</Label>
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {editingCard ? "Salvar" : "Criar Cartão"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {cards.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhum cartão cadastrado.<br />
              Clique em "Novo Cartão" para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const usedLimit = calculateUsedLimit(card.id);
            const availableLimit = card.credit_limit - usedLimit;
            const usagePercent = card.credit_limit > 0 ? (usedLimit / card.credit_limit) * 100 : 0;
            
            return (
              <Card 
                key={card.id} 
                className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  !card.is_active ? "opacity-60" : ""
                } ${selectedCard === card.id ? "ring-2 ring-primary" : ""}`}
                onClick={() => setSelectedCard(selectedCard === card.id ? null : card.id)}
              >
                <div 
                  className="absolute top-0 left-0 right-0 h-2"
                  style={{ backgroundColor: card.color || "#6366f1" }}
                />
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5" style={{ color: card.color || "#6366f1" }} />
                        {card.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {card.bank} • {card.brand}
                      </p>
                    </div>
                    <Badge variant={card.is_active ? "default" : "secondary"}>
                      {card.is_active ? "Ativo" : "Pausado"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Limite Utilizado</span>
                      <span className="font-medium">{usagePercent.toFixed(0)}%</span>
                    </div>
                    <Progress 
                      value={usagePercent} 
                      className="h-2"
                      style={{
                        ["--progress-background" as string]: usagePercent > 80 ? "#ef4444" : usagePercent > 50 ? "#f97316" : "#22c55e"
                      }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Disponível</p>
                      <p className="text-lg font-bold text-success">
                        R$ {availableLimit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fatura Atual</p>
                      <p className="text-lg font-bold text-destructive">
                        R$ {usedLimit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground flex justify-between border-t pt-2">
                    <span>Fecha dia {card.closing_day}</span>
                    <span>Vence dia {card.due_day}</span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(card);
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCard(card.id);
                      }}
                    >
                      <Eye className="h-3 w-3" />
                      Faturas
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Tem certeza que deseja excluir este cartão?")) {
                          deleteCard.mutate(card.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedCard && (
        <CardInvoicesSection 
          cardId={selectedCard} 
          card={cards.find(c => c.id === selectedCard)!}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}

function CardInvoicesSection({ 
  cardId, 
  card,
  onClose 
}: { 
  cardId: string; 
  card: ReturnType<typeof useCreditCards>["cards"][0];
  onClose: () => void;
}) {
  const { invoices } = useCreditCardInvoices(cardId);
  const { transactions, createTransaction, deleteTransaction } = useCreditCardTransactions(cardId);
  const { categories } = useCategories();
  
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [useCustomInstallments, setUseCustomInstallments] = useState(false);
  const [txForm, setTxForm] = useState({
    description: "",
    amount: 0,
    category_id: "",
    purchase_date: format(new Date(), "yyyy-MM-dd"),
    is_installment: false,
    total_installments: 2,
    custom_installment_values: [] as number[],
  });

  // Initialize custom installment values when switching modes
  const handleInstallmentCountChange = (count: number) => {
    const newValues = Array(count).fill(txForm.amount / count);
    setTxForm({ 
      ...txForm, 
      total_installments: count,
      custom_installment_values: newValues
    });
  };

  const handleCustomInstallmentChange = (index: number, value: number) => {
    const newValues = [...txForm.custom_installment_values];
    newValues[index] = value;
    setTxForm({ ...txForm, custom_installment_values: newValues });
  };

  const customInstallmentsTotal = txForm.custom_installment_values.reduce((sum, v) => sum + v, 0);
  const installmentsDiff = Math.abs(customInstallmentsTotal - txForm.amount);
  const installmentsValid = installmentsDiff < 0.01; // Allow 1 cent tolerance

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate custom installments if enabled
    if (txForm.is_installment && useCustomInstallments && !installmentsValid) {
      return; // Form validation will show error
    }
    
    createTransaction.mutate({
      card_id: cardId,
      description: txForm.description,
      amount: txForm.amount,
      category_id: txForm.category_id || undefined,
      purchase_date: txForm.purchase_date,
      is_installment: txForm.is_installment,
      total_installments: txForm.is_installment ? txForm.total_installments : undefined,
      custom_installment_values: txForm.is_installment && useCustomInstallments ? txForm.custom_installment_values : undefined,
      closingDay: card.closing_day,
      dueDay: card.due_day,
    });
    setIsAddingTransaction(false);
    setUseCustomInstallments(false);
    setTxForm({
      description: "",
      amount: 0,
      category_id: "",
      purchase_date: format(new Date(), "yyyy-MM-dd"),
      is_installment: false,
      total_installments: 2,
      custom_installment_values: [],
    });
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" style={{ color: card.color || "#6366f1" }} />
          Faturas - {card.name}
        </CardTitle>
        <div className="flex gap-2">
          <Dialog open={isAddingTransaction} onOpenChange={setIsAddingTransaction}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Nova Compra
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Compra</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div className="space-y-2">
                  <Label>Descrição *</Label>
                  <Input
                    value={txForm.description}
                    onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                    placeholder="Ex: Compra na Amazon"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Valor (R$) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={txForm.amount || ""}
                      onChange={(e) => setTxForm({ ...txForm, amount: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data da Compra</Label>
                    <Input
                      type="date"
                      value={txForm.purchase_date}
                      onChange={(e) => setTxForm({ ...txForm, purchase_date: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={txForm.category_id}
                    onValueChange={(value) => setTxForm({ ...txForm, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c.type === "expense").map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Compra Parcelada?</Label>
                  <Switch
                    checked={txForm.is_installment}
                    onCheckedChange={(checked) => setTxForm({ ...txForm, is_installment: checked })}
                  />
                </div>
                
                {txForm.is_installment && (
                  <div className="space-y-3 p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label>Número de Parcelas</Label>
                      <Input
                        type="number"
                        min="2"
                        max="48"
                        value={txForm.total_installments}
                        onChange={(e) => handleInstallmentCountChange(parseInt(e.target.value) || 2)}
                        className="w-20"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Definir valores manualmente?</Label>
                      <Switch
                        checked={useCustomInstallments}
                        onCheckedChange={(checked) => {
                          setUseCustomInstallments(checked);
                          if (checked) {
                            // Initialize with equal values
                            const equalValue = txForm.amount / txForm.total_installments;
                            setTxForm({
                              ...txForm,
                              custom_installment_values: Array(txForm.total_installments).fill(equalValue)
                            });
                          }
                        }}
                      />
                    </div>
                    
                    {!useCustomInstallments ? (
                      <p className="text-sm text-muted-foreground">
                        {txForm.total_installments}x de R$ {(txForm.amount / txForm.total_installments).toFixed(2)}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                          {txForm.custom_installment_values.map((value, index) => (
                            <div key={index} className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground w-6">{index + 1}x</span>
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={value || ""}
                                onChange={(e) => handleCustomInstallmentChange(index, parseFloat(e.target.value) || 0)}
                                className="h-8 text-sm"
                              />
                            </div>
                          ))}
                        </div>
                        
                        <div className={`text-sm p-2 rounded ${installmentsValid ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                          <div className="flex justify-between">
                            <span>Soma das parcelas:</span>
                            <span className="font-medium">R$ {customInstallmentsTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Valor total:</span>
                            <span className="font-medium">R$ {txForm.amount.toFixed(2)}</span>
                          </div>
                          {!installmentsValid && (
                            <p className="text-xs mt-1">
                              Diferença: R$ {installmentsDiff.toFixed(2)} - Ajuste os valores
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddingTransaction(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    Registrar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma fatura encontrada. Registre uma compra para começar.
          </p>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => {
              const invoiceTransactions = transactions.filter(t => t.invoice_id === invoice.id);
              const remaining = Number(invoice.total_amount) - Number(invoice.paid_amount);
              
              return (
                <Card key={invoice.id} className="border">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {format(new Date(invoice.reference_month), "MMMM yyyy", { locale: ptBR })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Fecha: {format(new Date(invoice.closing_date), "dd/MM")} • 
                          Vence: {format(new Date(invoice.due_date), "dd/MM")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          R$ {Number(invoice.total_amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                        <Badge variant={invoice.is_paid ? "default" : remaining > 0 ? "destructive" : "secondary"}>
                          {invoice.is_paid ? "Paga" : `Pendente: R$ ${remaining.toFixed(2)}`}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  {invoiceTransactions.length > 0 && (
                    <CardContent className="py-2 border-t">
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {invoiceTransactions.map((tx) => (
                          <div key={tx.id} className="flex items-center justify-between text-sm py-1">
                            <div className="flex items-center gap-2">
                              <span>{tx.description}</span>
                              {tx.is_installment && (
                                <Badge variant="outline" className="text-xs">
                                  {tx.installment_number}/{tx.total_installments}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                R$ {Number(tx.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-destructive"
                                onClick={() => deleteTransaction.mutate({ 
                                  id: tx.id, 
                                  cardId,
                                  deleteAllInstallments: tx.is_installment,
                                  parentId: tx.parent_transaction_id || tx.id
                                })}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Import categories hook
import { useCategories } from "@/hooks/useCategories";
