
import { AssessmentCard } from "./AssessmentCard";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Assessment {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  created_at: string;
}

interface AssessmentsListProps {
  assessments: Assessment[];
  isAdmin: boolean;
  isLoading: boolean;
  onStartAssessment: (assessmentId: string) => void;
  onCreateAssessment: () => void;
  onEditAssessment: (assessmentId: string) => void;
}

export function AssessmentsList({
  assessments,
  isAdmin,
  isLoading,
  onStartAssessment,
  onCreateAssessment,
  onEditAssessment,
}: AssessmentsListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 w-2/3 bg-muted rounded mb-2"></div>
              <div className="h-4 w-1/2 bg-muted rounded"></div>
              <div className="h-4 w-full bg-muted rounded mt-4 mb-2"></div>
              <div className="h-4 w-5/6 bg-muted rounded"></div>
              <div className="flex justify-between mt-4">
                <div className="h-5 w-1/3 bg-muted rounded"></div>
                <div className="h-10 w-1/3 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-1">Nenhuma avaliação disponível</h3>
          <p className="text-muted-foreground text-center max-w-md">
            {isAdmin
              ? "Você ainda não criou nenhuma avaliação. Clique no botão 'Nova Avaliação' para começar."
              : "Não há avaliações disponíveis para você no momento."}
          </p>
          
          {isAdmin && (
            <Button
              onClick={onCreateAssessment}
              className="mt-6"
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar primeira avaliação
            </Button>
          )}
        </CardContent>
      </Card>
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
        />
      ))}
    </div>
  );
}
