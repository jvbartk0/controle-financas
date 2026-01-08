import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface UserPreferences {
  id: string;
  user_id: string;
  currency: string | null;
  language: string | null;
  default_chart_type: string | null;
  layout_mode: string | null;
  panel_order: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface PreferencesInput {
  currency?: string;
  language?: string;
  default_chart_type?: string;
  layout_mode?: string;
  panel_order?: string[];
}

export const useUserPreferences = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      // Create default preferences if none exist
      if (!data) {
        const { data: newPrefs, error: createError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            currency: 'BRL',
            language: 'pt-BR',
            default_chart_type: 'bar',
            layout_mode: 'expanded',
            panel_order: ['balance', 'expenses', 'income'],
          })
          .select()
          .single();
        
        if (createError) throw createError;
        return newPrefs as UserPreferences;
      }
      
      return data as UserPreferences;
    },
    enabled: !!user,
  });

  const updatePreferences = useMutation({
    mutationFn: async (input: PreferencesInput) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('user_preferences')
        .update(input)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
      toast.success('Preferências salvas!');
    },
    onError: (error) => {
      toast.error('Erro ao salvar preferências: ' + error.message);
    },
  });

  return {
    preferences,
    isLoading,
    updatePreferences,
  };
};
