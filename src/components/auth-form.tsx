
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// Esquema de validação para formulários
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

  const { toast } = useToast();
  const navigate = useNavigate();

  // Verificar se já está logado
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
      // Adiciona logs para depuração
      console.log("Iniciando registro com:", { email, password });
      
      // Verificar se o email já está em uso usando uma consulta SELECT na tabela auth.users
      // Como não podemos acessar diretamente a tabela auth.users, vamos tentar fazer login
      // com o email para ver se o usuário já existe, sem criar um novo usuário
      const { error: emailCheckError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false // Esta opção é suportada pelo signInWithOtp
        }
      });
      
      // Se não houver erro específico indicando que o usuário não existe, assumimos que ele existe
      if (!emailCheckError || !emailCheckError.message.includes("Email not confirmed")) {
        console.log("Email já cadastrado:", email);
        throw new Error("Este email já está em uso. Por favor, tente outro email.");
      }
      
      // Tenta registrar o usuário
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: email.split('@')[0], // Nome padrão baseado no email
            avatar_url: "",
            is_admin: false // Por padrão, novos usuários não são administradores
          }
        }
      });

      console.log("Resposta do registro:", { data, error });

      if (error) {
        throw error;
      }

      // Verifica se o usuário foi criado com sucesso
      if (data && data.user) {
        toast({
          title: "Registro bem-sucedido",
          description: data.session 
            ? "Sua conta foi criada com sucesso! Redirecionando..." 
            : "Verifique seu email para confirmar o cadastro.",
        });

        // Inserir o registro na tabela profiles
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

        // Se houver uma sessão ativa, significa que não precisa de confirmação de email
        if (data.session) {
          navigate("/dashboard");
        } else {
          // Caso contrário, redireciona para a página de login
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
    
    // Adiciona log para depuração
    console.log("Formulário enviado:", { type, email, password, confirmPassword });
    
    // Validar o formulário
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
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                placeholder="seu@email.com"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "pl-10",
                  errors.email && "border-destructive focus-visible:ring-destructive"
                )}
                disabled={isLoading}
                required
              />
            </div>
            {errors.email && (
              <p className="text-sm font-medium text-destructive">{errors.email}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={type === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "pl-10",
                  errors.password && "border-destructive focus-visible:ring-destructive"
                )}
                disabled={isLoading}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
                <span className="sr-only">
                  {showPassword ? "Ocultar senha" : "Mostrar senha"}
                </span>
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm font-medium text-destructive">{errors.password}</p>
            )}
          </div>

          {type === "register" && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn(
                    "pl-10",
                    errors.confirmPassword && "border-destructive focus-visible:ring-destructive"
                  )}
                  disabled={isLoading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                  onClick={toggleConfirmPasswordVisibility}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span className="sr-only">
                    {showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                  </span>
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm font-medium text-destructive">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          {errors.form && (
            <div className="rounded-md bg-destructive/15 p-3">
              <p className="text-sm font-medium text-destructive">{errors.form}</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full cyber-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span className="ml-2">Aguarde...</span>
              </div>
            ) : type === "login" ? (
              "Entrar"
            ) : (
              "Criar conta"
            )}
          </Button>
          
          <div className="text-center text-sm">
            {type === "login" ? (
              <p>
                Não tem uma conta?{" "}
                <Button 
                  type="button"
                  variant="link" 
                  className="h-auto p-0 text-primary" 
                  onClick={() => navigate("/register")}
                  disabled={isLoading}
                >
                  Registre-se
                </Button>
              </p>
            ) : (
              <p>
                Já tem uma conta?{" "}
                <Button 
                  type="button"
                  variant="link" 
                  className="h-auto p-0 text-primary" 
                  onClick={() => navigate("/login")}
                  disabled={isLoading}
                >
                  Entrar
                </Button>
              </p>
            )}
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
