import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Calendar,
  Pencil,
  Trash2,
  Eye,
  RotateCcw,
} from "lucide-react";
import { formatDate } from "@/utils/date-utils";
import { resolveMaxAttempts } from "@/utils/assessment-utils";
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
  const maxAttempts = resolveMaxAttempts(assessment.max_attempts); // 0 = ilimitadas
  const canAttempt = maxAttempts === 0 || currentAttempts < maxAttempts;

  // Status visual do card (apenas apresentação)
  const isScheduled = !available && !!assessment.available_from;
  const isExhausted = !isAdmin && available && !canAttempt;

  return (
    <Card className="flex flex-col border-border bg-card transition-colors hover:border-primary/40">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest">
          {isScheduled ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="text-accent">Agendada</span>
            </>
          ) : isExhausted ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
              <span className="text-muted-foreground">Esgotada</span>
            </>
          ) : (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-slow" />
              <span className="text-primary">Disponível</span>
            </>
          )}
        </div>
        <CardTitle className="font-display text-lg leading-snug tracking-tight">
          {assessment.title}
        </CardTitle>
        <CardDescription className="line-clamp-3">
          {assessment.description || "Sem descrição"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {assessment.duration_minutes} min
          </div>

          {!isAdmin && maxAttempts > 0 && (
            <div className="flex items-center gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              {currentAttempts}/{maxAttempts} tentativas
            </div>
          )}

          {!isAdmin && maxAttempts === 0 && (
            <div className="flex items-center gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              tentativas ilimitadas
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(assessment.created_at)}
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
              <Button onClick={() => onStartAssessment(assessment.id)}>
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
