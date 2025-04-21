
import { Textarea } from "@/components/ui/textarea";

interface CodeQuestionProps {
  code: string;
  value?: string;
  onChange: (value: string) => void;
}

export function CodeQuestion({ code, value, onChange }: CodeQuestionProps) {
  return (
    <div className="space-y-3">
      <div className="rounded-md border bg-muted/50 p-3">
        <pre className="text-sm font-mono whitespace-pre-wrap">{code}</pre>
      </div>
      <Textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Digite seu código aqui"
        className="min-h-[150px] font-mono"
      />
    </div>
  );
}
