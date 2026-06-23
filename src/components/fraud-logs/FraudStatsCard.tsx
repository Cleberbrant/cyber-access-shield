import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, FileText, AlertTriangle } from "lucide-react";
import { FraudStats } from "@/types/fraud-logs";
import { formatEventType } from "@/utils/fraud-logs-utils";

interface FraudStatsCardProps {
  stats: FraudStats;
}

export function FraudStatsCard({ stats }: FraudStatsCardProps) {
  // Obter top 5 tipos de eventos
  const topEvents = Object.entries(stats.by_event_type)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const maxCount = topEvents[0]?.[1] || 1;

  return (
    <Card className="cyber-glass border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 font-display text-base">
          <BarChart3 className="h-5 w-5 text-primary" />
          Estatísticas Gerais
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="rounded-lg border border-border/60 bg-secondary/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Total de Logs
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <p className="font-display text-2xl font-bold">
              {stats.total_logs}
            </p>
          </div>

          <div className="rounded-lg border border-border/60 bg-secondary/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Alunos Flagged
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <p className="font-display text-2xl font-bold">
              {stats.total_students_flagged}
            </p>
          </div>

          <div className="rounded-lg border border-border/60 bg-secondary/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Avaliações
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/10 text-accent">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <p className="font-display text-2xl font-bold">
              {stats.total_assessments_with_logs}
            </p>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tipos de Eventos Mais Frequentes
          </h4>
          <div className="space-y-3">
            {topEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                Nenhum evento registrado
              </p>
            ) : (
              topEvents.map(([eventType, count]) => {
                const percentage = (count / maxCount) * 100;

                return (
                  <div key={eventType} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {formatEventType(eventType)}
                      </span>
                      <Badge
                        variant="secondary"
                        className="font-mono text-xs tabular-nums"
                      >
                        {count}
                      </Badge>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-gradient-brand transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
