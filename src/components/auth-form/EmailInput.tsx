
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface EmailInputProps {
  email: string;
  setEmail: (email: string) => void;
  error?: string;
  disabled?: boolean;
}

export function EmailInput({ email, setEmail, error, disabled }: EmailInputProps) {
  return (
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
            error && "border-destructive focus-visible:ring-destructive"
          )}
          disabled={disabled}
          required
        />
      </div>
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}
