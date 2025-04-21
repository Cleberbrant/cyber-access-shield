
import { Button } from "@/components/ui/button";

interface QuestionNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  answers: Record<string, any>;
  questionsMap: string[];
  onQuestionChange: (index: number) => void;
}

export function QuestionNavigation({ 
  currentQuestion, 
  totalQuestions, 
  answers, 
  questionsMap,
  onQuestionChange 
}: QuestionNavigationProps) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-2">Navegação rápida:</h3>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: totalQuestions }, (_, index) => (
          <Button
            key={index}
            variant={index === currentQuestion ? "default" : 
                   answers[questionsMap[index]] ? "outline" : "ghost"}
            size="sm"
            onClick={() => onQuestionChange(index)}
            className={index === currentQuestion ? "" : 
                    answers[questionsMap[index]] ? "border-primary/50" : "border-dashed"}
          >
            {index + 1}
          </Button>
        ))}
      </div>
    </div>
  );
}
