import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface FixedAccount {
  id: string;
  user_id: string;
  category_id: string | null;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  due_day: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FixedAccountInput {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  due_day: number;
  category_id?: string;
  is_active?: boolean;
}

export const useFixedAccounts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: fixedAccounts = [], isLoading } = useQuery({
    queryKey: ['fixedAccounts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('fixed_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('due_day');
      
      if (error) throw error;
      return data as FixedAccount[];
    },
    enabled: !!user,
  });

  const addFixedAccount = useMutation({
    mutationFn: async (input: FixedAccountInput) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('fixed_accounts')
        .insert({
          user_id: user.id,
          ...input,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixedAccounts'] });
      toast.success('Conta fixa adicionada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar conta fixa: ' + error.message);
    },
  });

  const updateFixedAccount = useMutation({
    mutationFn: async ({ id, ...input }: FixedAccountInput & { id: string }) => {
      const { data, error } = await supabase
        .from('fixed_accounts')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixedAccounts'] });
      toast.success('Conta fixa atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar conta fixa: ' + error.message);
    },
  });

  const deleteFixedAccount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('fixed_accounts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixedAccounts'] });
      toast.success('Conta fixa removida com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover conta fixa: ' + error.message);
    },
  });

  return {
    fixedAccounts,
    isLoading,
    addFixedAccount,
    updateFixedAccount,
    deleteFixedAccount,
  };
};
