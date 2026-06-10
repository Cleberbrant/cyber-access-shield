import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Calendar,
  Pencil,
  Trash2,
  Eye,
  RotateCcw,
} from "lucide-react";
import { formatDate } from "@/utils/date-utils";
import {
  isAssessmentAvailable,
  formatAvailabilityDate,
  getTimeUntilAvailable,
} from "@/utils/assessment-availability";

interface Assessment {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  created_at: string;
  max_attempts: number;
  available_from: string | null;
  currentAttempts?: number;
  hasIncompleteSession?: boolean;
  hasCompletedAttempt?: boolean;
}

interface AssessmentCardProps {
  assessment: Assessment;
  isAdmin: boolean;
  onStartAssessment: (assessmentId: string) => void;
  onEditAssessment: (assessmentId: string) => void;
  onDeleteAssessment: (assessmentId: string, assessmentTitle: string) => void;
  onViewResult?: (assessmentId: string) => void;
}

export function AssessmentCard({
  assessment,
  isAdmin,
  onStartAssessment,
  onEditAssessment,
  onDeleteAssessment,
  onViewResult,
}: AssessmentCardProps) {
  // Verificar se avaliação está disponível
  const available = isAssessmentAvailable(assessment.available_from);
  const timeInfo =
    assessment.available_from && !available
      ? getTimeUntilAvailable(assessment.available_from)
      : null;

  // Para alunos, verificar se pode tentar
  const currentAttempts = assessment.currentAttempts || 0;
  const maxAttempts = assessment.max_attempts || 1;
  const canAttempt = maxAttempts === 0 || currentAttempts < maxAttempts;

  // Status visual do card (apenas apresentação)
  const isScheduled = !available && !!assessment.available_from;
  const isExhausted = !isAdmin && available && !canAttempt;

  return (
    <Card className="cyber-glass flex flex-col transition-all duration-300 hover:-translate-y-1 hover:glow-border">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-snug">
            {assessment.title}
          </CardTitle>
          {isScheduled ? (
            <Badge className="shrink-0 bg-accent/15 text-accent border-accent/30 hover:bg-accent/15">
              Agendada
            </Badge>
          ) : isExhausted ? (
            <Badge className="shrink-0 bg-muted text-muted-foreground border-border hover:bg-muted">
              Esgotada
            </Badge>
          ) : (
            <Badge className="shrink-0 bg-primary/15 text-primary border-primary/30 hover:bg-primary/15">
              Disponível
            </Badge>
          )}
        </div>
        <CardDescription className="line-clamp-3">
          {assessment.description || "Sem descrição"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary/70" />
            {assessment.duration_minutes} minutos
          </div>

          {!isAdmin && maxAttempts > 0 && (
            <div className="flex items-center gap-1.5">
              <RotateCcw className="h-3.5 w-3.5 text-primary/70" />
              Tentativas: {currentAttempts}/{maxAttempts}
            </div>
          )}

          {!isAdmin && maxAttempts === 0 && (
            <div className="flex items-center gap-1.5">
              <RotateCcw className="h-3.5 w-3.5 text-primary/70" />
              Tentativas: Ilimitadas
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary/70" />
            Criada em {formatDate(assessment.created_at)}
          </div>
        </div>

        {!available && assessment.available_from && (
          <div className="mt-4 rounded-md border border-accent/20 bg-accent/10 px-3 py-2 text-xs text-accent">
            Disponível a partir de{" "}
            {formatAvailabilityDate(assessment.available_from)}
            {timeInfo ? ` (em ${timeInfo.formattedTime})` : ""}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {isAdmin ? (
          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              onClick={() => onEditAssessment(assessment.id)}
            >
              <Pencil className="mr-1 h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                onDeleteAssessment(assessment.id, assessment.title)
              }
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Excluir
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 ml-auto">
            {/* Botão Ver Resultado - SEMPRE visível se tiver tentativa completada */}
            {assessment.hasCompletedAttempt && onViewResult && (
              <Button
                variant="outline"
                onClick={() => onViewResult(assessment.id)}
              >
                <Eye className="mr-1 h-4 w-4" />
                Ver Resultado
              </Button>
            )}

            {/* Botão Iniciar/Continuar */}
            {available && canAttempt ? (
              <Button
                onClick={() => onStartAssessment(assessment.id)}
                className="bg-gradient-brand text-white glow-primary hover:opacity-90 transition-opacity"
              >
                {assessment.hasIncompleteSession ? "Continuar" : "Iniciar"}
              </Button>
            ) : !available ? (
              <Button disabled>Não disponível</Button>
            ) : (
              <Button disabled>Tentativas Esgotadas</Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
