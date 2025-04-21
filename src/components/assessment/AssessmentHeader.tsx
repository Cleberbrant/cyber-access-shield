
import { Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AssessmentHeaderProps {
  title: string;
  description?: string;
  timeLeft: string;
  currentQuestion: number;
  totalQuestions: number;
}

export function AssessmentHeader({ 
  title, 
  description, 
  timeLeft, 
  currentQuestion, 
  totalQuestions 
}: AssessmentHeaderProps) {
  const progress = (currentQuestion + 1) / totalQuestions * 100;
  
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        
        <div className="flex items-center gap-2 bg-card p-2 rounded-md border shadow">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span className="text-lg font-medium">{timeLeft}</span>
        </div>
      </div>
      
      <div className="mt-4">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Questão {currentQuestion + 1} de {totalQuestions}</span>
          <span>{Math.round(progress)}% concluído</span>
        </div>
      </div>
    </div>
  );
}
