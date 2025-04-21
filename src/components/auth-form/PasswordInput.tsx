
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

interface PasswordInputProps {
  password: string;
  setPassword: (pwd: string) => void;
  showPassword: boolean;
  togglePasswordVisibility: () => void;
  error?: string;
  disabled?: boolean;
  autoComplete?: string;
}

export function PasswordInput({
  password,
  setPassword,
  showPassword,
  togglePasswordVisibility,
  error,
  disabled,
  autoComplete = "current-password",
}: PasswordInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="password">Senha</Label>
      <div className="relative">
        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={cn(
            "pl-10",
            error && "border-destructive focus-visible:ring-destructive"
          )}
          disabled={disabled}
          required
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
          onClick={togglePasswordVisibility}
          disabled={disabled}
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
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}
