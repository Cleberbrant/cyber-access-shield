
import { Textarea } from "@/components/ui/textarea";

interface ShortAnswerQuestionProps {
  value?: string;
  onChange: (value: string) => void;
}

export function ShortAnswerQuestion({ value, onChange }: ShortAnswerQuestionProps) {
  return (
    <Textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Sua resposta"
      className="min-h-[120px]"
    />
  );
}
