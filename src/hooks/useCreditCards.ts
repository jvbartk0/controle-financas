import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type CreditCard = Tables<"credit_cards">;

export const useCreditCards = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["credit_cards", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("credit_cards")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      return data as CreditCard[];
    },
    enabled: !!user,
  });
};

export const useCreditCardWithTransactions = (cardId: string, month: number, year: number) => {
  const { user } = useAuth();
  
  const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
  const endDate = new Date(year, month, 0).toISOString().split("T")[0];

  return useQuery({
    queryKey: ["credit_card_transactions", cardId, month, year],
    queryFn: async () => {
      if (!user || !cardId) return { card: null, transactions: [], total: 0 };

      const [cardResult, transactionsResult] = await Promise.all([
        supabase.from("credit_cards").select("*").eq("id", cardId).single(),
        supabase
          .from("transactions")
          .select("*, category:categories(*)")
          .eq("credit_card_id", cardId)
          .gte("date", startDate)
          .lte("date", endDate)
          .order("date", { ascending: false }),
      ]);

      if (cardResult.error) throw cardResult.error;
      if (transactionsResult.error) throw transactionsResult.error;

      const total = transactionsResult.data.reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        card: cardResult.data as CreditCard,
        transactions: transactionsResult.data,
        total,
      };
    },
    enabled: !!user && !!cardId,
  });
};

export const useCreateCreditCard = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (card: Omit<TablesInsert<"credit_cards">, "user_id">) => {
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
      queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
    },
  });
};

export const useUpdateCreditCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"credit_cards"> & { id: string }) => {
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
      queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
    },
  });
};

export const useDeleteCreditCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("credit_cards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
    },
  });
};
