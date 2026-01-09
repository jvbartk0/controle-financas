import { useState } from "react";
import { Settings, User, Lock, Tag, Wallet, Palette, Sun, Moon, Check, Trash2, AlertTriangle } from "lucide-react";
import { useProfile, useUpdateProfile, useUpdatePassword } from "@/hooks/useProfile";
import { useCategories, useCreateCategory, useDeleteCategory } from "@/hooks/useCategories";
import { useAccounts, useCreateAccount, useDeleteAccount } from "@/hooks/useAccounts";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { LoadingState } from "@/components/shared/LoadingState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const CATEGORY_ICONS = ["tag", "shopping-cart", "home", "car", "utensils", "heart", "briefcase", "gift", "plane", "music", "film", "book"];

const ConfiguracoesPage = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfile();
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();
  const updateProfile = useUpdateProfile();
  const updatePassword = useUpdatePassword();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const createAccount = useCreateAccount();
  const deleteAccount = useDeleteAccount();

  const [profileForm, setProfileForm] = useState({ full_name: "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", newPassword: "", confirm: "" });
  const [categoryModal, setCategoryModal] = useState(false);
  const [accountModal, setAccountModal] = useState(false);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", type: "expense" as "income" | "expense", color: "#10b981", icon: "tag" });
  const [accountForm, setAccountForm] = useState({ name: "", type: "checking" as "checking" | "savings" | "cash" | "investment", balance: "", color: "#10b981" });

  // Delete user account state
  const [deleteUserModal, setDeleteUserModal] = useState(false);
  const [deleteUserPassword, setDeleteUserPassword] = useState("");
  const [deleteUserConfirmed, setDeleteUserConfirmed] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

  // Initialize profile form when data loads
  useState(() => {
    if (profile) setProfileForm({ full_name: profile.full_name });
  });

  const handleThemeChange = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    toast.success(`Tema ${newTheme === "dark" ? "escuro" : "claro"} aplicado`);
  };

  const handleUpdateProfile = async () => {
    if (!profileForm.full_name) { toast.error("Nome é obrigatório"); return; }
    try {
      await updateProfile.mutateAsync({ full_name: profileForm.full_name });
      toast.success("Perfil atualizado");
    } catch { toast.error("Erro ao atualizar perfil"); }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      toast.error("Nova senha deve ter pelo menos 8 caracteres");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirm) {
      toast.error("As senhas não coincidem");
      return;
    }
    try {
      await updatePassword.mutateAsync(passwordForm.newPassword);
      toast.success("Senha alterada com sucesso");
      setPasswordForm({ current: "", newPassword: "", confirm: "" });
    } catch { toast.error("Erro ao alterar senha"); }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name) { toast.error("Nome é obrigatório"); return; }
    try {
      await createCategory.mutateAsync({ name: categoryForm.name, type: categoryForm.type, color: categoryForm.color, icon: categoryForm.icon });
      toast.success("Categoria criada");
      setCategoryModal(false);
      setCategoryForm({ name: "", type: "expense", color: "#10b981", icon: "tag" });
    } catch { toast.error("Erro ao criar categoria"); }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.name) { toast.error("Nome é obrigatório"); return; }
    try {
      await createAccount.mutateAsync({ name: accountForm.name, type: accountForm.type, balance: parseFloat(accountForm.balance) || 0, color: accountForm.color });
      toast.success("Conta criada");
      setAccountModal(false);
      setAccountForm({ name: "", type: "checking", balance: "", color: "#10b981" });
    } catch { toast.error("Erro ao criar conta"); }
  };

  const handleDeleteAccount = async () => {
    if (!deleteAccountId) return;
    try {
      await deleteAccount.mutateAsync(deleteAccountId);
      toast.success("Conta excluída");
    } catch { toast.error("Erro ao excluir conta"); }
    setDeleteAccountId(null);
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryId) return;
    try {
      await deleteCategory.mutateAsync(deleteCategoryId);
      toast.success("Categoria excluída");
    } catch { toast.error("Erro ao excluir categoria"); }
    setDeleteCategoryId(null);
  };

  if (isLoading) return <LoadingState message="Carregando configurações..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" description="Gerencie seu perfil e preferências" icon={Settings} />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="profile"><User className="w-4 h-4 mr-2 hidden sm:inline" />Perfil</TabsTrigger>
          <TabsTrigger value="security"><Lock className="w-4 h-4 mr-2 hidden sm:inline" />Segurança</TabsTrigger>
          <TabsTrigger value="theme"><Palette className="w-4 h-4 mr-2 hidden sm:inline" />Tema</TabsTrigger>
          <TabsTrigger value="categories"><Tag className="w-4 h-4 mr-2 hidden sm:inline" />Categorias</TabsTrigger>
          <TabsTrigger value="accounts"><Wallet className="w-4 h-4 mr-2 hidden sm:inline" />Contas</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-semibold text-lg mb-4">Informações do Perfil</h3>
            <div><Label>Nome Completo</Label><Input value={profileForm.full_name || profile?.full_name || ""} onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })} /></div>
            <div><Label>E-mail</Label><Input value={user?.email || ""} disabled /></div>
            <div><Label>Tipo de Conta</Label><Input value={profile?.document_type === "PF" ? "Pessoa Física" : "Pessoa Jurídica"} disabled /></div>
            <Button onClick={handleUpdateProfile} disabled={updateProfile.isPending}>{updateProfile.isPending ? "Salvando..." : "Salvar Alterações"}</Button>
          </div>

          {/* Delete Account Section */}
          <div className="glass-card p-6 mt-6 border-destructive/30 border">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-destructive/10">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-destructive mb-2">Zona de Perigo</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Excluir sua conta removerá permanentemente todos os seus dados, incluindo transações, contas, cartões, parcelamentos e configurações. Esta ação não pode ser desfeita.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={() => setDeleteUserModal(true)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir Conta
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-semibold text-lg mb-4">Alterar Senha</h3>
            <div><Label>Senha Atual</Label><Input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} placeholder="Digite sua senha atual" /></div>
            <div><Label>Nova Senha</Label><Input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} placeholder="Mínimo 8 caracteres" /></div>
            <div><Label>Confirmar Nova Senha</Label><Input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} placeholder="Repita a nova senha" /></div>
            <Button onClick={handlePasswordChange} disabled={updatePassword.isPending}>{updatePassword.isPending ? "Alterando..." : "Alterar Senha"}</Button>
          </div>
        </TabsContent>

        <TabsContent value="theme">
          <div className="glass-card p-6">
            <h3 className="font-semibold text-lg mb-4">Selecione o Tema</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleThemeChange("dark")} 
                className={`relative p-6 rounded-xl border-2 transition-all hover:border-primary/50 ${theme === "dark" ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
              >
                {theme === "dark" && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                <div className="bg-[#0a0f1a] rounded-lg p-4 mb-4 border border-[#1e293b]">
                  <div className="flex gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <div className="h-3 w-16 bg-emerald-500 rounded mb-2" />
                  <div className="h-2 w-full bg-[#1e293b] rounded mb-1" />
                  <div className="h-2 w-3/4 bg-[#1e293b] rounded" />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Moon className="w-4 h-4" />
                  <span className="font-medium">Tema Escuro</span>
                </div>
              </button>
              <button 
                onClick={() => handleThemeChange("light")} 
                className={`relative p-6 rounded-xl border-2 transition-all hover:border-primary/50 ${theme === "light" ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
              >
                {theme === "light" && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                  <div className="flex gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <div className="h-3 w-16 bg-emerald-500 rounded mb-2" />
                  <div className="h-2 w-full bg-gray-200 rounded mb-1" />
                  <div className="h-2 w-3/4 bg-gray-200 rounded" />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Sun className="w-4 h-4" />
                  <span className="font-medium">Tema Claro</span>
                </div>
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">Sua preferência será salva automaticamente.</p>
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-lg">Suas Categorias</h3><Button size="sm" onClick={() => setCategoryModal(true)}>Nova Categoria</Button></div>
            <div className="space-y-2">
              {categories?.filter((c) => !c.is_system).map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color || "#10b981" }} />
                    <span>{c.name}</span>
                    <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">{c.type === "income" ? "Entrada" : "Saída"}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteCategoryId(c.id)}>Excluir</Button>
                </div>
              ))}
              {categories?.filter((c) => !c.is_system).length === 0 && <p className="text-muted-foreground text-center py-4">Nenhuma categoria personalizada</p>}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="accounts">
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-lg">Suas Contas</h3><Button size="sm" onClick={() => setAccountModal(true)}>Nova Conta</Button></div>
            <p className="text-sm text-muted-foreground mb-4">Cada conta tem seus próprios dados isolados. Selecione a conta ativa no seletor do topo da página.</p>
            <div className="space-y-2">
              {accounts?.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: a.color || "#10b981" }} />
                    <span className="font-medium">{a.name}</span>
                    <span className="text-xs text-muted-foreground">{a.type}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteAccountId(a.id)}>Excluir</Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Category Modal */}
      <Dialog open={categoryModal} onOpenChange={setCategoryModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Categoria</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div><Label>Nome</Label><Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required /></div>
            <div><Label>Tipo</Label><Select value={categoryForm.type} onValueChange={(v) => setCategoryForm({ ...categoryForm, type: v as "income" | "expense" })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="income">Entrada</SelectItem><SelectItem value="expense">Saída</SelectItem></SelectContent></Select></div>
            <div><Label>Cor</Label><Input type="color" value={categoryForm.color} onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })} /></div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setCategoryModal(false)}>Cancelar</Button><Button type="submit">Salvar</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Account Modal */}
      <Dialog open={accountModal} onOpenChange={setAccountModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Conta</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div><Label>Nome</Label><Input placeholder="Nubank, Sicoob, Carteira..." value={accountForm.name} onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })} required /></div>
            <div><Label>Tipo</Label><Select value={accountForm.type} onValueChange={(v) => setAccountForm({ ...accountForm, type: v as "checking" | "savings" | "cash" | "investment" })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="checking">Conta Corrente</SelectItem><SelectItem value="savings">Poupança</SelectItem><SelectItem value="cash">Dinheiro</SelectItem><SelectItem value="investment">Investimento</SelectItem></SelectContent></Select></div>
            <div><Label>Saldo Inicial</Label><Input type="number" step="0.01" value={accountForm.balance} onChange={(e) => setAccountForm({ ...accountForm, balance: e.target.value })} /></div>
            <div><Label>Cor</Label><Input type="color" value={accountForm.color} onChange={(e) => setAccountForm({ ...accountForm, color: e.target.value })} /></div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setAccountModal(false)}>Cancelar</Button><Button type="submit">Salvar</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmations */}
      <AlertDialog open={!!deleteAccountId} onOpenChange={() => setDeleteAccountId(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Excluir conta?</AlertDialogTitle><AlertDialogDescription>Todas as transações desta conta serão perdidas.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground">Excluir</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <AlertDialog open={!!deleteCategoryId} onOpenChange={() => setDeleteCategoryId(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Excluir categoria?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive text-destructive-foreground">Excluir</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>

      {/* Delete User Account Modal */}
      <Dialog open={deleteUserModal} onOpenChange={(open) => {
        if (!open) {
          setDeleteUserModal(false);
          setDeleteUserPassword("");
          setDeleteUserConfirmed(false);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Excluir Conta Permanentemente
            </DialogTitle>
            <DialogDescription>
              Esta ação é irreversível. Todos os seus dados serão excluídos permanentemente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="delete-password" className="text-sm font-medium">
                Digite sua senha atual para confirmar
              </Label>
              <Input
                id="delete-password"
                type="password"
                placeholder="Sua senha atual"
                value={deleteUserPassword}
                onChange={(e) => setDeleteUserPassword(e.target.value)}
                className="border-destructive/30 focus:border-destructive"
              />
            </div>

            {/* Confirmation Checkbox */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <Checkbox
                id="delete-confirm"
                checked={deleteUserConfirmed}
                onCheckedChange={(checked) => setDeleteUserConfirmed(checked === true)}
                className="mt-1"
              />
              <label htmlFor="delete-confirm" className="text-sm leading-relaxed cursor-pointer">
                Estou ciente de que ao excluir minha conta, todos os meus dados serão apagados permanentemente e não poderei mais acessar nenhuma informação.
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setDeleteUserModal(false);
                  setDeleteUserPassword("");
                  setDeleteUserConfirmed(false);
                }}
                className="flex-1"
                disabled={deletingUser}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (!deleteUserPassword) {
                    toast.error("Digite sua senha para confirmar");
                    return;
                  }
                  if (!deleteUserConfirmed) {
                    toast.error("Você deve confirmar que está ciente da exclusão");
                    return;
                  }

                  setDeletingUser(true);
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    const response = await supabase.functions.invoke("delete-user-account", {
                      body: { password: deleteUserPassword },
                    });

                    if (response.error) {
                      throw new Error(response.error.message || "Erro ao excluir conta");
                    }

                    if (response.data?.error) {
                      toast.error(response.data.error);
                      setDeletingUser(false);
                      return;
                    }

                    toast.success("Conta excluída com sucesso");
                    await signOut();
                    navigate("/");
                  } catch (error: any) {
                    console.error("Error deleting account:", error);
                    toast.error(error.message || "Erro ao excluir conta");
                    setDeletingUser(false);
                  }
                }}
                className="flex-1"
                disabled={deletingUser || !deleteUserPassword || !deleteUserConfirmed}
              >
                {deletingUser ? "Excluindo..." : "Confirmar Exclusão"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConfiguracoesPage;
