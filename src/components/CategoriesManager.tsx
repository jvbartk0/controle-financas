import { useState } from 'react';
import { useCategories, CategoryInput } from '@/hooks/useCategories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, Trash2, TrendingUp, TrendingDown,
  ShoppingCart, Home, Car, Utensils, Heart,
  Gamepad2, Plane, Book, Gift, Briefcase,
  Coffee, Music, Dumbbell, Shirt, Smartphone,
  Tv, Film, GraduationCap, Stethoscope, Baby,
  Dog, Scissors, Fuel, Bus, Train,
  CreditCard, Wallet, PiggyBank, Receipt, Banknote,
  Building, Store, Package, Pizza, Wine
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const CATEGORY_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
];

// Icon map for dynamic rendering
const ICON_MAP: Record<string, LucideIcon> = {
  'shopping-cart': ShoppingCart,
  'home': Home,
  'car': Car,
  'utensils': Utensils,
  'heart': Heart,
  'gamepad': Gamepad2,
  'plane': Plane,
  'book': Book,
  'gift': Gift,
  'briefcase': Briefcase,
  'coffee': Coffee,
  'music': Music,
  'dumbbell': Dumbbell,
  'shirt': Shirt,
  'smartphone': Smartphone,
  'tv': Tv,
  'film': Film,
  'graduation-cap': GraduationCap,
  'stethoscope': Stethoscope,
  'baby': Baby,
  'dog': Dog,
  'scissors': Scissors,
  'fuel': Fuel,
  'bus': Bus,
  'train': Train,
  'credit-card': CreditCard,
  'wallet': Wallet,
  'piggy-bank': PiggyBank,
  'receipt': Receipt,
  'banknote': Banknote,
  'building': Building,
  'store': Store,
  'package': Package,
  'pizza': Pizza,
  'wine': Wine,
};

const CATEGORY_ICONS = Object.keys(ICON_MAP);

// Helper to get icon component
const getCategoryIcon = (iconName: string | null): LucideIcon => {
  return ICON_MAP[iconName || 'shopping-cart'] || ShoppingCart;
};

export const CategoriesManager = () => {
  const { categories, isLoading, addCategory, deleteCategory } = useCategories();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CategoryInput>({
    name: '',
    type: 'expense',
    color: '#6366f1',
    icon: 'folder',
  });

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const resetForm = () => {
    setFormData({ name: '', type: 'expense', color: '#6366f1', icon: 'folder' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCategory.mutate(formData);
    setIsDialogOpen(false);
    resetForm();
  };

  const CategoryCard = ({ category }: { category: typeof categories[0] }) => {
    const IconComponent = getCategoryIcon(category.icon);
    
    return (
      <div
        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-secondary/50 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <IconComponent className="h-5 w-5" style={{ color: category.color || '#6366f1' }} />
          </div>
          <div>
            <p className="font-medium">{category.name}</p>
            <Badge variant="secondary" className="text-xs">
              {category.type === 'income' ? 'Receita' : 'Despesa'}
            </Badge>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (confirm('Excluir esta categoria?')) {
              deleteCategory.mutate(category.id);
            }
          }}
          className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded" />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Categorias
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Nova Categoria</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Alimentação, Transporte..."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'income' | 'expense') => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-income" />
                        Receita
                      </span>
                    </SelectItem>
                    <SelectItem value="expense">
                      <span className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-expense" />
                        Despesa
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORY_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full transition-all ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ícone</Label>
                <ScrollArea className="h-32 rounded-md border p-2">
                  <div className="grid grid-cols-7 gap-2">
                    {CATEGORY_ICONS.map(iconName => {
                      const IconComp = ICON_MAP[iconName];
                      return (
                        <button
                          key={iconName}
                          type="button"
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            formData.icon === iconName 
                              ? 'bg-primary text-primary-foreground scale-110' 
                              : 'bg-secondary hover:bg-secondary/80'
                          }`}
                          onClick={() => setFormData({ ...formData, icon: iconName })}
                          title={iconName}
                        >
                          <IconComp className="h-4 w-4" />
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  Criar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="expense">
          <TabsList className="w-full">
            <TabsTrigger value="expense" className="flex-1 gap-2">
              <TrendingDown className="h-4 w-4" />
              Despesas ({expenseCategories.length})
            </TabsTrigger>
            <TabsTrigger value="income" className="flex-1 gap-2">
              <TrendingUp className="h-4 w-4" />
              Receitas ({incomeCategories.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="expense" className="space-y-2 mt-4">
            {expenseCategories.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma categoria de despesa
              </p>
            ) : (
              expenseCategories.map(cat => <CategoryCard key={cat.id} category={cat} />)
            )}
          </TabsContent>
          <TabsContent value="income" className="space-y-2 mt-4">
            {incomeCategories.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma categoria de receita
              </p>
            ) : (
              incomeCategories.map(cat => <CategoryCard key={cat.id} category={cat} />)
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
