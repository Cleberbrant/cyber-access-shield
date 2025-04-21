
import { Button } from "@/components/ui/button";
import React from "react";

interface AuthFormFooterProps {
  type: "login" | "register";
  isLoading: boolean;
  navigate: (path: string) => void;
}

export function AuthFormFooter({ type, isLoading, navigate }: AuthFormFooterProps) {
  return (
    <div className="flex flex-col space-y-4">
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
    </div>
  );
}
