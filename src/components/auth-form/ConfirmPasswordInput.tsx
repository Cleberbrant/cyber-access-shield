
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

interface ConfirmPasswordInputProps {
  confirmPassword: string;
  setConfirmPassword: (pwd: string) => void;
  showConfirmPassword: boolean;
  toggleConfirmPasswordVisibility: () => void;
  error?: string;
  disabled?: boolean;
}

export function ConfirmPasswordInput({
  confirmPassword,
  setConfirmPassword,
  showConfirmPassword,
  toggleConfirmPasswordVisibility,
  error,
  disabled,
}: ConfirmPasswordInputProps) {
  return (
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
          onClick={toggleConfirmPasswordVisibility}
          disabled={disabled}
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
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}
