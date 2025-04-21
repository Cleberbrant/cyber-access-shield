
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Pencil } from "lucide-react";
import { formatDate } from "@/utils/date-utils";

interface Assessment {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  created_at: string;
}

interface AssessmentCardProps {
  assessment: Assessment;
  isAdmin: boolean;
  onStartAssessment: (assessmentId: string) => void;
  onEditAssessment: (assessmentId: string) => void;
}

export function AssessmentCard({ 
  assessment, 
  isAdmin, 
  onStartAssessment, 
  onEditAssessment 
}: AssessmentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{assessment.title}</CardTitle>
        <CardDescription>
          <div className="flex items-center text-sm">
            <Calendar className="mr-1 h-3 w-3" />
            Criada em {formatDate(assessment.created_at)}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {assessment.description || "Sem descrição"}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-1 h-4 w-4" />
          {assessment.duration_minutes} minutos
        </div>
        
        {isAdmin ? (
          <Button
            variant="outline"
            onClick={() => onEditAssessment(assessment.id)}
          >
            <Pencil className="mr-1 h-4 w-4" />
            Editar
          </Button>
        ) : (
          <Button
            onClick={() => onStartAssessment(assessment.id)}
          >
            Iniciar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
