import { useState } from 'react';
import { useFixedAccounts, FixedAccountInput } from '@/hooks/useFixedAccounts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

export const FixedAccountsList = () => {
  const { fixedAccounts, isLoading, addFixedAccount, updateFixedAccount, deleteFixedAccount } = useFixedAccounts();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<FixedAccountInput>({
    type: 'expense',
    amount: 0,
    description: '',
    due_day: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addFixedAccount.mutateAsync(form);
    setIsOpen(false);
    setForm({
      type: 'expense',
      amount: 0,
      description: '',
      due_day: 1,
    });
  };

  const toggleActive = (id: string, currentStatus: boolean) => {
    updateFixedAccount.mutate({
      id,
      is_active: !currentStatus,
      type: fixedAccounts.find(f => f.id === id)?.type || 'expense',
      amount: fixedAccounts.find(f => f.id === id)?.amount || 0,
      description: fixedAccounts.find(f => f.id === id)?.description || '',
      due_day: fixedAccounts.find(f => f.id === id)?.due_day || 1,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-12 bg-muted rounded" />
        <div className="h-64 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Contas Fixas</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Conta Fixa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Conta Fixa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={form.type}
                  onValueChange={(value: 'income' | 'expense') => setForm({ ...form, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Entrada</SelectItem>
                    <SelectItem value="expense">Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ex: Aluguel, Salário..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Valor</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount || ''}
                  onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Dia do Vencimento</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={form.due_day}
                  onChange={(e) => setForm({ ...form, due_day: parseInt(e.target.value) || 1 })}
                />
              </div>

              <Button type="submit" className="w-full" disabled={addFixedAccount.isPending}>
                {addFixedAccount.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {fixedAccounts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Nenhuma conta fixa cadastrada</p>
            <p className="text-sm text-muted-foreground mt-2">
              Cadastre suas contas recorrentes como aluguel, salário, etc.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {fixedAccounts.map((account) => (
            <Card key={account.id} className={!account.is_active ? 'opacity-50' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      account.type === 'income' ? 'bg-income/10' : 'bg-expense/10'
                    }`}>
                      {account.type === 'income' ? (
                        <TrendingUp className="w-5 h-5 text-income" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-expense" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{account.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>Dia {account.due_day}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      account.type === 'income' ? 'text-income' : 'text-expense'
                    }`}>
                      {account.type === 'income' ? '+' : '-'} {formatCurrency(Number(account.amount))}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={account.is_active}
                      onCheckedChange={() => toggleActive(account.id, account.is_active)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {account.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteFixedAccount.mutate(account.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
