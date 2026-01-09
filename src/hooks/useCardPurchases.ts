import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CardPurchase {
  id: string;
  user_id: string;
  credit_card_id: string;
  account_id: string | null;
  description: string;
  amount: number;
  purchase_date: string;
  category_id: string | null;
  is_installment: boolean;
  installment_count: number;
  installment_value: number | null;
  created_at: string;
  category?: { name: string; color: string } | null;
}

export const useCardPurchases = (cardId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["card_purchases", user?.id, cardId],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("card_purchases")
        .select("*, category:categories(name, color)")
        .eq("user_id", user.id)
        .order("purchase_date", { ascending: false });

      if (cardId) {
        query = query.eq("credit_card_id", cardId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CardPurchase[];
    },
    enabled: !!user,
  });
};

export const useCreateCardPurchase = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (purchase: {
      credit_card_id: string;
      account_id?: string | null;
      description: string;
      amount: number;
      purchase_date: string;
      category_id?: string | null;
      is_installment: boolean;
      installment_count: number;
      installment_value?: number | null;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("card_purchases")
        .insert({ ...purchase, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      // If it's an installment purchase, create installment record
      if (purchase.is_installment && purchase.installment_count > 1) {
        await supabase.from("installments").insert({
          user_id: user.id,
          credit_card_id: purchase.credit_card_id,
          account_id: purchase.account_id,
          description: purchase.description,
          total_amount: purchase.amount,
          total_installments: purchase.installment_count,
          current_installment: 1,
          start_date: purchase.purchase_date,
        });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["card_purchases"] });
      queryClient.invalidateQueries({ queryKey: ["installments"] });
      queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
    },
  });
};

export const useDeleteCardPurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("card_purchases").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["card_purchases"] });
      queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
    },
  });
};
