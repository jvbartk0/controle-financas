import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format, startOfMonth, addMonths, setDate } from "date-fns";

export interface CreditCardInvoice {
  id: string;
  card_id: string;
  user_id: string;
  reference_month: string;
  closing_date: string;
  due_date: string;
  total_amount: number;
  paid_amount: number;
  is_paid: boolean;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

export function useCreditCardInvoices(cardId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["credit-card-invoices", cardId, user?.id],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from("credit_card_invoices")
        .select("*")
        .order("reference_month", { ascending: false });
      
      if (cardId) {
        query = query.eq("card_id", cardId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as CreditCardInvoice[];
    },
    enabled: !!user,
  });

  const createOrGetInvoice = useMutation({
    mutationFn: async ({ 
      cardId, 
      closingDay, 
      dueDay, 
      referenceDate 
    }: { 
      cardId: string; 
      closingDay: number; 
      dueDay: number;
      referenceDate: Date;
    }) => {
      if (!user) throw new Error("User not authenticated");
      
      const refMonth = startOfMonth(referenceDate);
      const refMonthStr = format(refMonth, "yyyy-MM-dd");
      
      // Check if invoice exists
      const { data: existing } = await supabase
        .from("credit_card_invoices")
        .select("*")
        .eq("card_id", cardId)
        .eq("reference_month", refMonthStr)
        .maybeSingle();
      
      if (existing) return existing;
      
      // Calculate closing and due dates
      const closingDate = setDate(refMonth, closingDay);
      const dueDateMonth = dueDay > closingDay ? refMonth : addMonths(refMonth, 1);
      const dueDate = setDate(dueDateMonth, dueDay);
      
      const { data, error } = await supabase
        .from("credit_card_invoices")
        .insert({
          card_id: cardId,
          user_id: user.id,
          reference_month: refMonthStr,
          closing_date: format(closingDate, "yyyy-MM-dd"),
          due_date: format(dueDate, "yyyy-MM-dd"),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-card-invoices"] });
    },
  });

  const payInvoice = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const { data: invoice } = await supabase
        .from("credit_card_invoices")
        .select("*")
        .eq("id", id)
        .single();
      
      if (!invoice) throw new Error("Fatura não encontrada");
      
      const newPaidAmount = Number(invoice.paid_amount) + amount;
      const isPaid = newPaidAmount >= Number(invoice.total_amount);
      
      const { data, error } = await supabase
        .from("credit_card_invoices")
        .update({ 
          paid_amount: newPaidAmount,
          is_paid: isPaid,
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-card-invoices"] });
      toast.success("Pagamento registrado!");
    },
    onError: (error) => {
      toast.error("Erro ao registrar pagamento: " + error.message);
    },
  });

  return {
    invoices,
    isLoading,
    createOrGetInvoice,
    payInvoice,
  };
}
