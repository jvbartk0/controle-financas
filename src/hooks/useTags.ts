import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  created_at: string;
}

export interface TagInput {
  name: string;
  color?: string;
}

export const useTags = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['tags', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      return data as Tag[];
    },
    enabled: !!user,
  });

  const addTag = useMutation({
    mutationFn: async (input: TagInput) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      // Check for duplicate
      const existing = tags.find(t => t.name.toLowerCase() === input.name.toLowerCase());
      if (existing) {
        throw new Error('Já existe uma tag com este nome');
      }
      
      const { data, error } = await supabase
        .from('tags')
        .insert({
          user_id: user.id,
          name: input.name,
          color: input.color || '#6366f1',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag criada com sucesso!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateTag = useMutation({
    mutationFn: async ({ id, ...input }: TagInput & { id: string }) => {
      const { data, error } = await supabase
        .from('tags')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar tag: ' + error.message);
    },
  });

  const deleteTag = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag removida com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover tag: ' + error.message);
    },
  });

  return {
    tags,
    isLoading,
    addTag,
    updateTag,
    deleteTag,
  };
};
