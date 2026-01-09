import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, User, Building, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Logo from "@/assets/logo_basefin.svg";

type AccountType = "PF" | "PJ" | null;

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  
  const [mode, setMode] = useState<"login" | "signup">(
    searchParams.get("mode") === "signup" ? "signup" : "login"
  );
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [companyName, setCompanyName] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    cnpj: "",
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const urlMode = searchParams.get("mode");
    if (urlMode === "signup") {
      setMode("signup");
    } else {
      setMode("login");
    }
  }, [searchParams]);

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const handleCNPJChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatCNPJ(value);
    setFormData({ ...formData, cnpj: formatted });
    setCompanyName("");
    
    // Auto-validate CNPJ and fetch company name when complete
    const numbers = formatted.replace(/\D/g, "");
    if (numbers.length === 14) {
      try {
        const { data } = await supabase.functions.invoke("validate-document", {
          body: { document: numbers, type: "CNPJ" },
        });
        if (data?.valid && data?.data?.razaoSocial) {
          setCompanyName(data.data.razaoSocial);
        }
      } catch {
        // Ignore validation errors during typing
      }
    }
  };

  const validateCNPJ = async () => {
    const numbers = formData.cnpj.replace(/\D/g, "");
    
    try {
      const { data, error } = await supabase.functions.invoke("validate-document", {
        body: { document: numbers, type: "CNPJ" },
      });
      
      if (error) throw error;
      return data;
    } catch {
      return { valid: false, message: "Erro ao validar CNPJ" };
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(formData.email, formData.password);
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao entrar",
        description: error.message === "Invalid login credentials" 
          ? "Email ou senha incorretos" 
          : error.message,
      });
    } else {
      toast({
        title: "Bem-vindo de volta!",
        description: "Login realizado com sucesso.",
      });
      navigate("/dashboard");
    }
    
    setIsLoading(false);
  };

  const handleSignupStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (step === 1 && accountType) {
      setStep(2);
    } else if (step === 2) {
      // Validate password
      if (formData.password.length < 8) {
        toast({
          variant: "destructive",
          title: "Senha muito curta",
          description: "A senha deve ter no mínimo 8 caracteres.",
        });
        setIsLoading(false);
        return;
      }

      // For PF: go directly to account creation (no document validation)
      // For PJ: go to CNPJ validation step
      if (accountType === "PF") {
        await createAccount();
      } else {
        setStep(3);
      }
    } else if (step === 3 && accountType === "PJ") {
      // Validate CNPJ
      const validation = await validateCNPJ();
      
      if (!validation.valid) {
        toast({
          variant: "destructive",
          title: "CNPJ inválido",
          description: validation.message,
        });
        setIsLoading(false);
        return;
      }

      await createAccount();
    }
    
    setIsLoading(false);
  };

  const createAccount = async () => {
    // Create auth account
    const { error } = await signUp(formData.email, formData.password, {
      full_name: formData.name,
      document_type: accountType,
      document_number: accountType === "PJ" ? formData.cnpj.replace(/\D/g, "") : null,
    });

    if (error) {
      let errorMessage = error.message;
      if (error.message.includes("already registered")) {
        errorMessage = "Este email já está cadastrado. Tente fazer login.";
      }
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: errorMessage,
      });
      return;
    }

    // Create profile
    const { data: { user: newUser } } = await supabase.auth.getUser();
    
    if (newUser) {
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: newUser.id,
        full_name: formData.name,
        document_type: accountType as "PF" | "PJ",
        document_number: accountType === "PJ" ? formData.cnpj.replace(/\D/g, "") : "N/A",
      });

      if (profileError) {
        console.error("Error creating profile:", profileError);
      }

      // Create default account
      await supabase.from("accounts").insert({
        user_id: newUser.id,
        name: "Conta Principal",
        type: "checking",
        balance: 0,
      });
    }

    toast({
      title: "Conta criada com sucesso!",
      description: "Bem-vindo ao BaseFin.",
    });
    navigate("/dashboard");
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            className="pl-10"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-10 pr-10"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Não tem uma conta?{" "}
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setStep(1);
          }}
          className="text-primary hover:underline"
        >
          Criar conta
        </button>
      </p>
    </form>
  );

  const renderSignupStep1 = () => (
    <div className="space-y-6">
      <p className="text-center text-muted-foreground">
        Selecione o tipo de conta que deseja criar:
      </p>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setAccountType("PF")}
          className={`glass-card-hover p-6 text-center transition-all ${
            accountType === "PF" ? "border-primary ring-2 ring-primary/20" : ""
          }`}
        >
          <User className="w-10 h-10 text-primary mx-auto mb-3" />
          <div className="font-semibold">Pessoa Física</div>
          <div className="text-sm text-muted-foreground">Para uso pessoal</div>
        </button>

        <button
          type="button"
          onClick={() => setAccountType("PJ")}
          className={`glass-card-hover p-6 text-center transition-all ${
            accountType === "PJ" ? "border-primary ring-2 ring-primary/20" : ""
          }`}
        >
          <Building className="w-10 h-10 text-primary mx-auto mb-3" />
          <div className="font-semibold">Empresa</div>
          <div className="text-sm text-muted-foreground">Para negócios</div>
        </button>
      </div>

      <Button
        onClick={handleSignupStep}
        className="w-full"
        disabled={!accountType || isLoading}
      >
        Continuar
      </Button>
    </div>
  );

  const renderSignupStep2 = () => (
    <form onSubmit={handleSignupStep} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nome completo</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            id="name"
            type="text"
            placeholder="Seu nome"
            className="pl-10"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            className="pl-10"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Mínimo 8 caracteres"
            className="pl-10 pr-10"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            minLength={8}
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {accountType === "PF" ? "Criando conta..." : "Carregando..."}
          </>
        ) : (
          accountType === "PF" ? "Criar conta" : "Continuar"
        )}
      </Button>
    </form>
  );

  const renderSignupStep3 = () => (
    <form onSubmit={handleSignupStep} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="cnpj">CNPJ</Label>
        <Input
          id="cnpj"
          type="text"
          placeholder="00.000.000/0000-00"
          value={formData.cnpj}
          onChange={handleCNPJChange}
          maxLength={18}
          required
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Seu CNPJ será validado e buscaremos os dados da empresa automaticamente.
        </p>
        {companyName && (
          <p className="text-sm text-primary font-medium">
            Razão Social: {companyName}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Validando CNPJ...
          </>
        ) : (
          "Criar conta"
        )}
      </Button>
    </form>
  );

  // Calculate total steps based on account type
  const getTotalSteps = () => {
    if (accountType === "PF") return 2;
    return 3;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(160_84%_39%/0.05),transparent_50%)]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-8">
          {/* Header */}
          <div className="text-center mb-8 relative">
            {mode === "signup" && step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="absolute top-0 left-0 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            
            <Link to="/" className="inline-block mb-6">
              <img src={Logo} alt="BaseFin" className="h-12 w-12 mx-auto" />
            </Link>
            
            <h1 className="text-2xl font-bold">
              {mode === "login"
                ? "Bem-vindo de volta"
                : step === 1
                ? "Criar sua conta"
                : step === 2
                ? "Seus dados"
                : "Validação CNPJ"}
            </h1>
            
            {mode === "signup" && (
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: getTotalSteps() }, (_, i) => i + 1).map((s) => (
                  <div
                    key={s}
                    className={`w-8 h-1 rounded-full transition-colors ${
                      s <= step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          {mode === "login" && renderLoginForm()}
          {mode === "signup" && step === 1 && renderSignupStep1()}
          {mode === "signup" && step === 2 && renderSignupStep2()}
          {mode === "signup" && step === 3 && accountType === "PJ" && renderSignupStep3()}

          {/* Footer */}
          {mode === "signup" && (
            <p className="text-center text-sm text-muted-foreground mt-6">
              Já tem uma conta?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setStep(1);
                  setAccountType(null);
                }}
                className="text-primary hover:underline"
              >
                Entrar
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
