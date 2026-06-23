import { cn } from "@/lib/utils";

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
  onQuestionChange,
}: QuestionNavigationProps) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
        Navegação rápida
      </h3>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: totalQuestions }, (_, index) => {
          const isCurrent = index === currentQuestion;
          const isAnswered = Boolean(answers[questionsMap[index]]);
          return (
            <button
              key={index}
              type="button"
              onClick={() => onQuestionChange(index)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors",
                isCurrent &&
                  "border-primary bg-primary/10 text-primary ring-2 ring-primary/40",
                !isCurrent &&
                  isAnswered &&
                  "border-primary/40 bg-primary text-primary-foreground",
                !isCurrent &&
                  !isAnswered &&
                  "border-dashed border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
