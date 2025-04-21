
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface TrueFalseQuestionProps {
  id: string;
  value?: string;
  onChange: (value: string) => void;
}

export function TrueFalseQuestion({ id, value, onChange }: TrueFalseQuestionProps) {
  return (
    <RadioGroup value={value} onValueChange={onChange}>
      <div className="flex space-x-8">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="true" id={`q${id}-true`} />
          <Label htmlFor={`q${id}-true`}>Verdadeiro</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="false" id={`q${id}-false`} />
          <Label htmlFor={`q${id}-false`}>Falso</Label>
        </div>
      </div>
    </RadioGroup>
  );
}
