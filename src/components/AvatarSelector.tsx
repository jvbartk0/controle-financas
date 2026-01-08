import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, User, Check } from 'lucide-react';
import { maleAvatars, femaleAvatars, AvatarGender, AvatarOption } from '@/lib/avatars';
import { cn } from '@/lib/utils';

interface AvatarSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatar?: string | null;
  onSelectAvatar: (avatarUrl: string) => void;
  onUploadPhoto: (file: File) => void;
  isUploading?: boolean;
}

export const AvatarSelector = ({
  open,
  onOpenChange,
  currentAvatar,
  onSelectAvatar,
  onUploadPhoto,
  isUploading,
}: AvatarSelectorProps) => {
  const [selectedGender, setSelectedGender] = useState<AvatarGender>('male');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatars = selectedGender === 'male' ? maleAvatars : femaleAvatars;

  const handleSelectPreset = (avatar: AvatarOption) => {
    setSelectedAvatar(avatar.src);
  };

  const handleConfirmSelection = () => {
    if (selectedAvatar) {
      onSelectAvatar(selectedAvatar);
      onOpenChange(false);
      setSelectedAvatar(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadPhoto(file);
      onOpenChange(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Escolher Avatar
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="preset" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="preset" className="flex-1 gap-2">
              <User className="h-4 w-4" />
              Selecionar Avatar
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex-1 gap-2">
              <Upload className="h-4 w-4" />
              Enviar Foto
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preset" className="space-y-4 mt-4">
            {/* Gender Selection */}
            <div className="flex gap-2">
              <Button
                variant={selectedGender === 'male' ? 'default' : 'outline'}
                onClick={() => setSelectedGender('male')}
                className="flex-1"
              >
                Masculino
              </Button>
              <Button
                variant={selectedGender === 'female' ? 'default' : 'outline'}
                onClick={() => setSelectedGender('female')}
                className="flex-1"
              >
                Feminino
              </Button>
            </div>

            {/* Avatar Grid */}
            <div className="grid grid-cols-3 gap-3">
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => handleSelectPreset(avatar)}
                  className={cn(
                    "relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105",
                    selectedAvatar === avatar.src
                      ? "border-primary ring-2 ring-primary ring-offset-2"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <img
                    src={avatar.src}
                    alt={`Avatar ${avatar.id}`}
                    className="w-full h-full object-cover"
                  />
                  {selectedAvatar === avatar.src && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Confirm Button */}
            <Button
              onClick={handleConfirmSelection}
              disabled={!selectedAvatar}
              className="w-full"
            >
              Confirmar Seleção
            </Button>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4 mt-4">
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-xl">
              <Camera className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                Envie uma foto pessoal para usar como avatar
              </p>
              <Button onClick={handleUploadClick} disabled={isUploading} className="gap-2">
                <Upload className="h-4 w-4" />
                {isUploading ? 'Enviando...' : 'Escolher Arquivo'}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                PNG, JPG ou GIF. Máximo 5MB.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
