import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ValidationRequest {
  document: string;
  type: "CNPJ";
}

interface ValidationResponse {
  valid: boolean;
  message: string;
  data?: {
    razaoSocial?: string;
  };
}

// CNPJ mathematical validation algorithm
function validateCNPJMath(cnpj: string): boolean {
  const numbers = cnpj.replace(/\D/g, "");
  
  if (numbers.length !== 14) return false;
  
  // Check for known invalid CNPJs (all same digits)
  if (/^(\d)\1{13}$/.test(numbers)) return false;
  
  // Validate first check digit
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(numbers[i]) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(numbers[12])) return false;
  
  // Validate second check digit
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(numbers[i]) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(numbers[13])) return false;
  
  return true;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { document, type }: ValidationRequest = await req.json();
    
    // Only CNPJ validation is supported
    if (type !== "CNPJ") {
      return new Response(
        JSON.stringify({ valid: false, message: "Tipo de documento não suportado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const cleanDoc = document.replace(/\D/g, "");
    
    // Step 1: Mathematical validation
    const isMathValid = validateCNPJMath(cleanDoc);
    
    if (!isMathValid) {
      return new Response(
        JSON.stringify({ valid: false, message: "CNPJ inválido - dígitos verificadores incorretos" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    // Step 2: API validation via BrasilAPI
    try {
      const apiResponse = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanDoc}`);
      
      if (apiResponse.ok) {
        const data = await apiResponse.json();
        const response: ValidationResponse = {
          valid: true,
          message: "CNPJ válido",
          data: {
            razaoSocial: data.razao_social,
          },
        };
        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } else {
        // API returned error - CNPJ doesn't exist or is invalid
        return new Response(
          JSON.stringify({ valid: false, message: "CNPJ não encontrado na base da Receita Federal" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    } catch (apiError) {
      console.error("BrasilAPI error:", apiError);
      // API unavailable - block registration for security
      return new Response(
        JSON.stringify({ valid: false, message: "Erro ao validar CNPJ. Tente novamente." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
  } catch (error) {
    console.error("Validation error:", error);
    return new Response(
      JSON.stringify({ valid: false, message: "Erro ao processar solicitação" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
