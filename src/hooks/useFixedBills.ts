import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface FixedBill {
  id: string;
  user_id: string;
  account_id: string | null;
  name: string;
  amount: number;
  category_id: string | null;
  due_day: number;
  frequency: string;
  is_paid: boolean;
  next_due_date: string;
  importance: string;
  created_at: string;
  updated_at: string;
  category?: { name: string; color: string } | null;
}

export const useFixedBills = (accountId?: string, status?: "all" | "pending" | "paid" | "overdue") => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["fixed_bills", user?.id, accountId, status],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("fixed_bills")
        .select("*, category:categories(name, color)")
        .eq("user_id", user.id)
        .order("next_due_date", { ascending: true });

      if (accountId) {
        query = query.eq("account_id", accountId);
      }

      const { data, error } = await query;
      if (error) throw error;

      let result = data as FixedBill[];
      const today = new Date().toISOString().split("T")[0];

      if (status === "pending") {
        result = result.filter((b) => !b.is_paid && b.next_due_date >= today);
      } else if (status === "paid") {
        result = result.filter((b) => b.is_paid);
      } else if (status === "overdue") {
        result = result.filter((b) => !b.is_paid && b.next_due_date < today);
      }

      return result;
    },
    enabled: !!user,
  });
};

export const useCreateFixedBill = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (bill: {
      account_id?: string | null;
      name: string;
      amount: number;
      category_id?: string | null;
      due_day: number;
      frequency: string;
      next_due_date: string;
      importance?: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("fixed_bills")
        .insert({ ...bill, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fixed_bills"] });
    },
  });
};

export const useUpdateFixedBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<FixedBill>) => {
      const { data, error } = await supabase
        .from("fixed_bills")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fixed_bills"] });
    },
  });
};

export const useDeleteFixedBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("fixed_bills").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fixed_bills"] });
    },
  });
};

export const useMarkBillAsPaid = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ billId, accountId }: { billId: string; accountId?: string }) => {
      if (!user) throw new Error("User not authenticated");

      // Get the bill details
      const { data: bill, error: billError } = await supabase
        .from("fixed_bills")
        .select("*")
        .eq("id", billId)
        .single();

      if (billError) throw billError;

      // Create a transaction for this payment
      await supabase.from("transactions").insert({
        user_id: user.id,
        account_id: accountId || bill.account_id,
        description: `Pagamento: ${bill.name}`,
        amount: bill.amount,
        type: "expense",
        category_id: bill.category_id,
        is_fixed: true,
        date: new Date().toISOString().split("T")[0],
      });

      // Calculate next due date based on frequency
      const currentDue = new Date(bill.next_due_date);
      let nextDue = new Date(currentDue);

      if (bill.frequency === "monthly") {
        nextDue.setMonth(nextDue.getMonth() + 1);
      } else if (bill.frequency === "weekly") {
        nextDue.setDate(nextDue.getDate() + 7);
      } else if (bill.frequency === "yearly") {
        nextDue.setFullYear(nextDue.getFullYear() + 1);
      }

      // Update the bill with new due date
      const { data, error } = await supabase
        .from("fixed_bills")
        .update({
          is_paid: false,
          next_due_date: nextDue.toISOString().split("T")[0],
        })
        .eq("id", billId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fixed_bills"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};
