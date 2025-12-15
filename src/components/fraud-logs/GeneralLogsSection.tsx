import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AlertCircle, User, ChevronDown, ChevronUp } from "lucide-react";
import { FraudLog } from "@/types/fraud-logs";
import { LogEventCard } from "./LogEventCard";

interface GeneralLogsSectionProps {
  logs: FraudLog[];
}

export function GeneralLogsSection({ logs }: GeneralLogsSectionProps) {
  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-1">
            Nenhum log geral encontrado
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            Não há registros de eventos de segurança fora do contexto de
            avaliações.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Agrupar logs por usuário
  const logsByUser = logs.reduce((acc, log) => {
    const userId = log.user_id;
    if (!acc[userId]) {
      acc[userId] = {
        user_email: log.user_email || "Desconhecido",
        user_name: log.user_name,
        logs: [],
      };
    }
    acc[userId].logs.push(log);
    return acc;
  }, {} as Record<string, { user_email: string; user_name: string | null; logs: FraudLog[] }>);

  return (
    <div className="space-y-4">
      {Object.entries(logsByUser).map(([userId, userData]) => (
        <UserLogsCard key={userId} userData={userData} />
      ))}
    </div>
  );
}

// Componente para card de usuário com logs (com accordion)
interface UserLogsCardProps {
  userData: {
    user_email: string;
    user_name: string | null;
    logs: FraudLog[];
  };
}

function UserLogsCard({ userData }: UserLogsCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="border-l-4 border-l-cyber-teal">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <User className="h-5 w-5 text-cyber-teal" />
              <div>
                <CardTitle className="text-lg">{userData.user_email}</CardTitle>
                {userData.user_name && (
                  <p className="text-sm text-muted-foreground">
                    {userData.user_name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {userData.logs.length} evento
                {userData.logs.length !== 1 ? "s" : ""}
              </Badge>

              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent>
            <div className="space-y-3">
              {userData.logs.map((log) => (
                <LogEventCard key={log.id} log={log} />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
