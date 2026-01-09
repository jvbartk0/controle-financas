import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Installment = Tables<"installments"> & {
  credit_card?: Tables<"credit_cards"> | null;
};

export const useInstallments = (status?: "active" | "completed") => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["installments", user?.id, status],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("installments")
        .select("*, credit_card:credit_cards(*)")
        .eq("user_id", user.id)
        .order("start_date", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      let result = data as Installment[];

      if (status === "active") {
        result = result.filter((i) => i.current_installment <= i.total_installments);
      } else if (status === "completed") {
        result = result.filter((i) => i.current_installment > i.total_installments);
      }

      return result;
    },
    enabled: !!user,
  });
};

export const useCreateInstallment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (installment: Omit<TablesInsert<"installments">, "user_id">) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("installments")
        .insert({ ...installment, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["installments"] });
    },
  });
};

export const useUpdateInstallment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"installments"> & { id: string }) => {
      const { data, error } = await supabase
        .from("installments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["installments"] });
    },
  });
};

export const useDeleteInstallment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("installments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["installments"] });
    },
  });
};
