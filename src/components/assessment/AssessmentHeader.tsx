import { Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface AssessmentHeaderProps {
  title: string;
  description?: string;
  timeLeft: string;
  currentQuestion: number;
  totalQuestions: number;
  /** Segundos restantes (opcional) — muda a cor do chip do timer */
  timeLeftSeconds?: number;
  /** Duração total em segundos (opcional) */
  totalSeconds?: number;
}

export function AssessmentHeader({
  title,
  description,
  timeLeft,
  currentQuestion,
  totalQuestions,
  timeLeftSeconds,
  totalSeconds,
}: AssessmentHeaderProps) {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  // Estado do timer: normal → atenção (<25%) → crítico (<10%)
  const fraction =
    timeLeftSeconds !== undefined && totalSeconds
      ? timeLeftSeconds / totalSeconds
      : 1;
  const timerClass =
    fraction < 0.1
      ? "border-destructive/60 text-destructive animate-pulse"
      : fraction < 0.25
        ? "border-yellow-500/50 text-yellow-500"
        : "border-primary/30 text-foreground";

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        <div
          className={cn(
            "flex items-center gap-2 rounded-lg border bg-card px-3 py-2",
            timerClass
          )}
        >
          <Clock className="h-4 w-4" />
          <span className="font-mono text-lg font-medium tabular-nums">
            {timeLeft}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <Progress value={progress} className="h-1.5" />
        <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
          <span>
            Questão {currentQuestion + 1} de {totalQuestions}
          </span>
          <span>{Math.round(progress)}% concluído</span>
        </div>
      </div>
    </div>
  );
}
