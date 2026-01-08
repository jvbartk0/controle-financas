import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format, startOfMonth, addMonths, setDate } from "date-fns";

export interface CreditCardTransaction {
  id: string;
  card_id: string;
  invoice_id: string | null;
  user_id: string;
  description: string;
  amount: number;
  category_id: string | null;
  purchase_date: string;
  is_installment: boolean;
  installment_number: number | null;
  total_installments: number | null;
  parent_transaction_id: string | null;
  created_at: string;
  updated_at: string;
  categories?: { name: string; color: string | null; icon: string | null } | null;
}

export interface CreditCardTransactionInsert {
  card_id: string;
  description: string;
  amount: number;
  category_id?: string;
  purchase_date?: string;
  is_installment?: boolean;
  total_installments?: number;
  custom_installment_values?: number[];
}

// Helper function to calculate which invoice a purchase belongs to
function getInvoiceReferenceMonth(purchaseDate: Date, closingDay: number): Date {
  const dayOfMonth = purchaseDate.getDate();
  
  // If purchase is after closing day, it goes to next month's invoice
  if (dayOfMonth > closingDay) {
    return startOfMonth(addMonths(purchaseDate, 1));
  }
  return startOfMonth(purchaseDate);
}

export function useCreditCardTransactions(cardId?: string, invoiceId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["credit-card-transactions", cardId, invoiceId, user?.id],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from("credit_card_transactions")
        .select("*, categories(name, color, icon)")
        .order("purchase_date", { ascending: false });
      
      if (cardId) {
        query = query.eq("card_id", cardId);
      }
      if (invoiceId) {
        query = query.eq("invoice_id", invoiceId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as CreditCardTransaction[];
    },
    enabled: !!user,
  });

  const createTransaction = useMutation({
    mutationFn: async (transaction: CreditCardTransactionInsert & { closingDay: number; dueDay: number }) => {
      if (!user) throw new Error("User not authenticated");
      
      const { closingDay, dueDay, custom_installment_values, ...txData } = transaction;
      const purchaseDate = txData.purchase_date ? new Date(txData.purchase_date) : new Date();
      
      // If it's an installment purchase
      if (txData.is_installment && txData.total_installments && txData.total_installments > 1) {
        const useCustomValues = custom_installment_values && custom_installment_values.length === txData.total_installments;
        const transactions = [];
        
        for (let i = 1; i <= txData.total_installments; i++) {
          // Use custom value if available, otherwise divide equally
          const installmentAmount = useCustomValues 
            ? custom_installment_values[i - 1] 
            : txData.amount / txData.total_installments;
          
          // Calculate the date for each installment
          const installmentDate = i === 1 ? purchaseDate : addMonths(purchaseDate, i - 1);
          const refMonth = getInvoiceReferenceMonth(installmentDate, closingDay);
          const refMonthStr = format(refMonth, "yyyy-MM-dd");
          
          // Get or create the invoice for this installment
          const { data: invoice } = await supabase
            .from("credit_card_invoices")
            .select("id")
            .eq("card_id", txData.card_id)
            .eq("reference_month", refMonthStr)
            .maybeSingle();
          
          let invoiceId = invoice?.id;
          
          if (!invoiceId) {
            const closingDate = setDate(refMonth, closingDay);
            const dueDateMonth = dueDay > closingDay ? refMonth : addMonths(refMonth, 1);
            const dueDateObj = setDate(dueDateMonth, dueDay);
            
            const { data: newInvoice, error: invoiceError } = await supabase
              .from("credit_card_invoices")
              .insert({
                card_id: txData.card_id,
                user_id: user.id,
                reference_month: refMonthStr,
                closing_date: format(closingDate, "yyyy-MM-dd"),
                due_date: format(dueDateObj, "yyyy-MM-dd"),
              })
              .select()
              .single();
            
            if (invoiceError) throw invoiceError;
            invoiceId = newInvoice.id;
          }
          
          transactions.push({
            card_id: txData.card_id,
            invoice_id: invoiceId,
            user_id: user.id,
            description: txData.description,
            amount: installmentAmount,
            category_id: txData.category_id || null,
            purchase_date: format(purchaseDate, "yyyy-MM-dd"), // Original purchase date
            is_installment: true,
            installment_number: i,
            total_installments: txData.total_installments,
          });
        }
        
        // Insert all installment transactions
        const { error } = await supabase
          .from("credit_card_transactions")
          .insert(transactions);
        
        if (error) throw error;
        
        // Update invoice totals
        await updateInvoiceTotals(txData.card_id);
        
        return { installments: transactions.length };
      } else {
        // Single transaction
        const refMonth = getInvoiceReferenceMonth(purchaseDate, closingDay);
        const refMonthStr = format(refMonth, "yyyy-MM-dd");
        
        // Get or create invoice
        const { data: invoice } = await supabase
          .from("credit_card_invoices")
          .select("id")
          .eq("card_id", txData.card_id)
          .eq("reference_month", refMonthStr)
          .maybeSingle();
        
        let invoiceId = invoice?.id;
        
        if (!invoiceId) {
          const closingDate = setDate(refMonth, closingDay);
          const dueDateMonth = dueDay > closingDay ? refMonth : addMonths(refMonth, 1);
          const dueDateObj = setDate(dueDateMonth, dueDay);
          
          const { data: newInvoice, error: invoiceError } = await supabase
            .from("credit_card_invoices")
            .insert({
              card_id: txData.card_id,
              user_id: user.id,
              reference_month: refMonthStr,
              closing_date: format(closingDate, "yyyy-MM-dd"),
              due_date: format(dueDateObj, "yyyy-MM-dd"),
            })
            .select()
            .single();
          
          if (invoiceError) throw invoiceError;
          invoiceId = newInvoice.id;
        }
        
        const { data, error } = await supabase
          .from("credit_card_transactions")
          .insert({
            card_id: txData.card_id,
            invoice_id: invoiceId,
            user_id: user.id,
            description: txData.description,
            amount: txData.amount,
            category_id: txData.category_id || null,
            purchase_date: format(purchaseDate, "yyyy-MM-dd"),
            is_installment: false,
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // Update invoice total
        await updateInvoiceTotals(txData.card_id);
        
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-card-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["credit-card-invoices"] });
      toast.success("Compra registrada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao registrar compra: " + error.message);
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async ({ id, cardId, deleteAllInstallments, parentId }: { 
      id: string; 
      cardId: string;
      deleteAllInstallments?: boolean;
      parentId?: string | null;
    }) => {
      if (deleteAllInstallments && parentId) {
        // Delete all related installments
        const { error } = await supabase
          .from("credit_card_transactions")
          .delete()
          .or(`id.eq.${parentId},parent_transaction_id.eq.${parentId}`);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("credit_card_transactions")
          .delete()
          .eq("id", id);
        
        if (error) throw error;
      }
      
      // Update invoice totals
      await updateInvoiceTotals(cardId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-card-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["credit-card-invoices"] });
      toast.success("Transação excluída com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir transação: " + error.message);
    },
  });

  return {
    transactions,
    isLoading,
    createTransaction,
    deleteTransaction,
  };
}

// Helper function to update invoice totals
async function updateInvoiceTotals(cardId: string) {
  // Get all invoices for this card
  const { data: invoices } = await supabase
    .from("credit_card_invoices")
    .select("id")
    .eq("card_id", cardId);
  
  if (!invoices) return;
  
  for (const invoice of invoices) {
    // Calculate total from transactions
    const { data: transactions } = await supabase
      .from("credit_card_transactions")
      .select("amount")
      .eq("invoice_id", invoice.id);
    
    const total = transactions?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
    
    await supabase
      .from("credit_card_invoices")
      .update({ total_amount: total })
      .eq("id", invoice.id);
  }
}
