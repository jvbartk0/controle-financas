import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface CreditCard {
  id: string;
  user_id: string;
  name: string;
  bank: string | null;
  brand: string;
  credit_limit: number;
  closing_day: number;
  due_day: number;
  is_active: boolean;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreditCardInsert {
  name: string;
  bank?: string;
  brand: string;
  credit_limit: number;
  closing_day: number;
  due_day: number;
  is_active?: boolean;
  color?: string;
}

export function useCreditCards() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ["credit-cards", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("credit_cards")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as CreditCard[];
    },
    enabled: !!user,
  });

  const createCard = useMutation({
    mutationFn: async (card: CreditCardInsert) => {
      if (!user) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from("credit_cards")
        .insert({ ...card, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
      toast.success("Cartão criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar cartão: " + error.message);
    },
  });

  const updateCard = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CreditCard> & { id: string }) => {
      const { data, error } = await supabase
        .from("credit_cards")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
      toast.success("Cartão atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar cartão: " + error.message);
    },
  });

  const deleteCard = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("credit_cards")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
      toast.success("Cartão excluído com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir cartão: " + error.message);
    },
  });

  return {
    cards,
    isLoading,
    createCard,
    updateCard,
    deleteCard,
  };
}
