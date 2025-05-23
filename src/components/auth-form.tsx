import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { EmailInput } from "./auth-form/EmailInput";
import { PasswordInput } from "./auth-form/PasswordInput";
import { ConfirmPasswordInput } from "./auth-form/ConfirmPasswordInput";
import { AuthFormFooter } from "./auth-form/AuthFormFooter";

const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(8, { message: "A senha deve ter pelo menos 8 caracteres" }),
});

const registerSchema = loginSchema.extend({
  confirmPassword: z.string().min(8, { message: "A senha deve ter pelo menos 8 caracteres" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type FormErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

interface AuthFormProps {
  type: "login" | "register";
  className?: string;
}

export function AuthForm({ type, className }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [resentEmail, setResentEmail] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/dashboard");
      }
    };
    
    checkSession();
  }, [navigate]);

  const validateForm = () => {
    try {
      if (type === "login") {
        loginSchema.parse({ email, password });
      } else {
        registerSchema.parse({ email, password, confirmPassword });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: FormErrors = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0] as keyof FormErrors] = err.message;
          }
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const handleResendConfirmationEmail = async () => {
    setResendLoading(true);
    setResentEmail(false);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (error) {
        toast({
          title: "Erro ao reenviar e-mail",
          description: error.message || "Não foi possível reenviar o e-mail de confirmação.",
          variant: "destructive",
        });
      } else {
        setResentEmail(true);
        toast({
          title: "Confirmação enviada",
          description: "Verifique sua caixa de entrada e o spam.",
        });
      }
    } catch (e: any) {
      toast({
        title: "Erro ao reenviar e-mail",
        description: e.message,
        variant: "destructive",
      });
    }
    setResendLoading(false);
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      console.log("Tentando login com:", email, password);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Erro de autenticação:", error);

        if (error.message === "Email not confirmed" || error.code === "email_not_confirmed") {
          setErrors({
            form: "Você precisa confirmar seu e-mail antes de fazer login. Verifique sua caixa de entrada e o spam!"
          });
          return;
        }

        throw error;
      }

      console.log("Login bem-sucedido:", data);
      toast({
        title: "Login bem-sucedido",
        description: "Redirecionando para o dashboard...",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);

      setErrors({
        form: error.message || "Erro ao fazer login. Verifique suas credenciais."
      });
      
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Verifique suas credenciais e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      console.log("Iniciando registro com:", { email, password });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: email.split('@')[0],
            avatar_url: "",
            is_admin: false
          }
        }
      });

      console.log("Resposta do registro:", { data, error });

      if (error) {
        throw error;
      }

      if (data && data.user) {
        toast({
          title: "Registro bem-sucedido",
          description: data.session 
            ? "Sua conta foi criada com sucesso! Redirecionando..." 
            : "Verifique seu email para confirmar o cadastro.",
        });

        if (data.user.id) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                full_name: email.split('@')[0],
                avatar_url: "",
                is_admin: false
              }
            ]);
            
          if (profileError) {
            console.error("Erro ao criar perfil:", profileError);
          }
        }

        if (data.session) {
          navigate("/dashboard");
        } else {
          navigate("/login");
        }
      } else {
        throw new Error("Não foi possível criar a conta. Tente novamente mais tarde.");
      }
    } catch (error: any) {
      console.error("Erro ao registrar:", error);
      
      setErrors({
        form: error.message || "Erro ao registrar. Tente novamente mais tarde."
      });
      
      toast({
        title: "Erro ao registrar",
        description: error.message || "Verifique os dados e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    console.log("Formulário enviado:", { type, email, password, confirmPassword });
    
    if (!validateForm()) {
      console.log("Validação falhou, erros:", errors);
      return;
    }
    
    console.log("Validação bem-sucedida, prosseguindo com o envio");
    
    if (type === "login") {
      await handleLogin();
    } else {
      await handleRegister();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Card className={cn("w-full max-w-md border-slate-200 shadow-md", className)}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {type === "login" ? "Entrar" : "Criar Conta"}
        </CardTitle>
        <CardDescription>
          {type === "login" 
            ? "Entre com seu email e senha para acessar sua conta" 
            : "Preencha suas informações para criar uma nova conta"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <EmailInput
            email={email}
            setEmail={setEmail}
            error={errors.email}
            disabled={isLoading}
          />

          <PasswordInput
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            togglePasswordVisibility={togglePasswordVisibility}
            error={errors.password}
            disabled={isLoading}
            autoComplete={type === "login" ? "current-password" : "new-password"}
          />

          {type === "register" && (
            <ConfirmPasswordInput
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              showConfirmPassword={showConfirmPassword}
              toggleConfirmPasswordVisibility={toggleConfirmPasswordVisibility}
              error={errors.confirmPassword}
              disabled={isLoading}
            />
          )}

          {errors.form && (
            <div className="rounded-md bg-destructive/15 p-3 space-y-2">
              <p className="text-sm font-medium text-destructive">{errors.form}</p>
              {errors.form.toLowerCase().includes("confirmar seu e-mail") && (
                <div className="flex flex-col items-start gap-2">
                  <button
                    type="button"
                    className="text-sm text-primary underline disabled:opacity-50"
                    onClick={handleResendConfirmationEmail}
                    disabled={resendLoading || resentEmail}
                  >
                    {resendLoading ? "Reenviando..." : (resentEmail ? "E-mail reenviado!" : "Reenviar e-mail de confirmação")}
                  </button>
                  {resentEmail && (
                    <span className="text-xs text-muted-foreground">
                      Caso não apareça, verifique o spam ou aguarde alguns minutos.
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <AuthFormFooter type={type} isLoading={isLoading} navigate={navigate} />
        </CardFooter>
      </form>
    </Card>
  );
}
