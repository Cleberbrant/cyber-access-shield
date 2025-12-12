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
  CheckCircle,
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>{assessment.title}</CardTitle>
          {!available && assessment.available_from && (
            <Badge variant="secondary" className="ml-2">
              Em {timeInfo?.formattedTime}
            </Badge>
          )}
        </div>
        <CardDescription>
          <div className="flex items-center text-sm">
            <Calendar className="mr-1 h-3 w-3" />
            Criada em {formatDate(assessment.created_at)}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {assessment.description || "Sem descrição"}
        </p>

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            {assessment.duration_minutes} minutos
          </div>

          {!isAdmin && maxAttempts > 0 && (
            <div className="flex items-center">
              <CheckCircle className="mr-1 h-4 w-4" />
              Tentativas: {currentAttempts}/{maxAttempts}
            </div>
          )}

          {!isAdmin && maxAttempts === 0 && (
            <div className="flex items-center">
              <CheckCircle className="mr-1 h-4 w-4" />
              Tentativas: Ilimitadas
            </div>
          )}
        </div>

        {!available && assessment.available_from && (
          <div className="mt-3 p-2 bg-muted rounded text-xs">
            Disponível a partir de{" "}
            {formatAvailabilityDate(assessment.available_from)}
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
