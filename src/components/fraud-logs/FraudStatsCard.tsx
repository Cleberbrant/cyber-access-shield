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
    <Card className="border-2 border-cyber-blue/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-cyber-blue" />
          Estatísticas Gerais
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-secondary/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Total de Logs
              </span>
              <AlertTriangle className="h-4 w-4 text-cyber-blue" />
            </div>
            <p className="text-2xl font-bold">{stats.total_logs}</p>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Alunos Flagged
              </span>
              <Users className="h-4 w-4 text-cyber-teal" />
            </div>
            <p className="text-2xl font-bold">{stats.total_students_flagged}</p>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Avaliações</span>
              <FileText className="h-4 w-4 text-cyber-purple" />
            </div>
            <p className="text-2xl font-bold">
              {stats.total_assessments_with_logs}
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm">
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
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyber-blue to-cyber-teal transition-all duration-300"
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
