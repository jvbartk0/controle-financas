import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { password } = await req.json();
    if (!password) {
      return new Response(JSON.stringify({ error: "Password is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client with user's token to get their info
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "User not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify password by trying to sign in
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const { error: signInError } = await supabaseAuth.auth.signInWithPassword({
      email: user.email!,
      password: password,
    });

    if (signInError) {
      return new Response(JSON.stringify({ error: "Senha incorreta" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service role client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Delete all user data in order (respecting foreign key constraints)
    const userId = user.id;

    // 1. Delete card_purchases (depends on credit_cards)
    await supabaseAdmin.from("card_purchases").delete().eq("user_id", userId);

    // 2. Delete transactions (depends on accounts, categories, credit_cards, installments)
    await supabaseAdmin.from("transactions").delete().eq("user_id", userId);

    // 3. Delete fixed_bills (depends on accounts, categories)
    await supabaseAdmin.from("fixed_bills").delete().eq("user_id", userId);

    // 4. Delete installments (depends on accounts, credit_cards)
    await supabaseAdmin.from("installments").delete().eq("user_id", userId);

    // 5. Delete credit_cards (depends on accounts)
    await supabaseAdmin.from("credit_cards").delete().eq("user_id", userId);

    // 6. Delete accounts
    await supabaseAdmin.from("accounts").delete().eq("user_id", userId);

    // 7. Delete user categories (not system ones)
    await supabaseAdmin.from("categories").delete().eq("user_id", userId);

    // 8. Delete profile
    await supabaseAdmin.from("profiles").delete().eq("user_id", userId);

    // 9. Finally delete the auth user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error("Error deleting auth user:", deleteError);
      return new Response(JSON.stringify({ error: "Erro ao excluir usuário" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
