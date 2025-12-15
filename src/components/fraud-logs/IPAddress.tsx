import { useState } from "react";
import { Eye, EyeOff, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { maskIP } from "@/utils/fraud-logs-utils";

interface IPAddressProps {
  ip: string | null;
  className?: string;
}

export function IPAddress({ ip, className }: IPAddressProps) {
  const [revealed, setRevealed] = useState(false);

  if (!ip) {
    return (
      <Badge variant="secondary" className={className}>
        <Globe className="h-3 w-3 mr-1" />
        IP não disponível
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className={className}>
        <Globe className="h-3 w-3 mr-1" />
        {revealed ? ip : maskIP(ip)}
      </Badge>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setRevealed(!revealed)}
            >
              {revealed ? (
                <EyeOff className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {revealed ? "Ocultar IP completo" : "Revelar IP completo"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
