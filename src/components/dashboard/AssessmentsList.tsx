import { AssessmentCard } from "./AssessmentCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";

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

interface AssessmentsListProps {
  assessments: Assessment[];
  isAdmin: boolean;
  isLoading: boolean;
  onStartAssessment: (assessmentId: string) => void;
  onCreateAssessment: () => void;
  onEditAssessment: (assessmentId: string) => void;
  onDeleteAssessment: (assessmentId: string, assessmentTitle: string) => void;
  onViewResult?: (assessmentId: string) => void;
}

export function AssessmentsList({
  assessments,
  isAdmin,
  isLoading,
  onStartAssessment,
  onCreateAssessment,
  onEditAssessment,
  onDeleteAssessment,
  onViewResult,
}: AssessmentsListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="cyber-glass rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-28" />
            </div>
            <div className="flex justify-end pt-2">
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="cyber-glass rounded-xl animate-fade-up">
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <LogoMark size={64} className="opacity-20 mb-6" />
          <h3 className="text-xl font-semibold mb-2">
            Nenhuma avaliação disponível
          </h3>
          <p className="text-muted-foreground max-w-md">
            {isAdmin
              ? "Você ainda não criou nenhuma avaliação. Clique no botão 'Nova Avaliação' para começar."
              : "Não há avaliações disponíveis para você no momento."}
          </p>

          {isAdmin && (
            <Button
              onClick={onCreateAssessment}
              className="mt-6 bg-gradient-brand text-white glow-primary hover:opacity-90 transition-opacity"
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar primeira avaliação
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {assessments.map((assessment) => (
        <AssessmentCard
          key={assessment.id}
          assessment={assessment}
          isAdmin={isAdmin}
          onStartAssessment={onStartAssessment}
          onEditAssessment={onEditAssessment}
          onDeleteAssessment={onDeleteAssessment}
          onViewResult={onViewResult}
        />
      ))}
    </div>
  );
}
