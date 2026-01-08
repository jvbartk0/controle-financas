import { useState, useRef } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarSelector } from '@/components/AvatarSelector';
import { Camera, User, Mail, LogOut, Pencil } from 'lucide-react';
import { toast } from 'sonner';

export const ProfileSettings = () => {
  const { profile, isLoading, updateProfile, uploadAvatar } = useProfile();
  const { user, signOut } = useAuth();
  const [fullName, setFullName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);

  const handleUpdateName = async () => {
    if (!fullName.trim()) return;
    await updateProfile.mutateAsync({ full_name: fullName });
  };

  const handleUploadPhoto = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setIsUploading(true);
    try {
      await uploadAvatar(file);
      toast.success('Foto atualizada com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectPresetAvatar = async (avatarUrl: string) => {
    try {
      await updateProfile.mutateAsync({ avatar_url: avatarUrl });
      toast.success('Avatar atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar avatar');
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-muted rounded" />
        <div className="h-64 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Perfil</h1>

      <Card>
        <CardHeader>
          <CardTitle>Foto de Perfil</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="relative group">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => setIsAvatarSelectorOpen(true)}
              disabled={isUploading}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Pencil className="w-6 h-6 text-white" />
            </button>
          </div>
          <div className="flex-1">
            <Button
              onClick={() => setIsAvatarSelectorOpen(true)}
              variant="outline"
              className="gap-2"
            >
              <Camera className="w-4 h-4" />
              Alterar Avatar
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Escolha um avatar pré-definido ou envie sua própria foto
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Nome Completo
            </Label>
            <div className="flex gap-2">
              <Input
                id="name"
                defaultValue={profile?.full_name || ''}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome"
              />
              <Button 
                onClick={handleUpdateName}
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              value={user?.email || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              O email não pode ser alterado
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conta</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair da Conta
          </Button>
        </CardContent>
      </Card>

      <AvatarSelector
        open={isAvatarSelectorOpen}
        onOpenChange={setIsAvatarSelectorOpen}
        currentAvatar={profile?.avatar_url}
        onSelectAvatar={handleSelectPresetAvatar}
        onUploadPhoto={handleUploadPhoto}
        isUploading={isUploading}
      />
    </div>
  );
};
