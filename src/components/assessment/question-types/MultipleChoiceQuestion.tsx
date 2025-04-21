
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface MultipleChoiceQuestionProps {
  id: string;
  options: string[];
  value?: string;
  onChange: (value: string) => void;
}

export function MultipleChoiceQuestion({ id, options, value, onChange }: MultipleChoiceQuestionProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      className="space-y-3"
    >
      {options.map((option, index) => (
        <div key={index} className="flex items-start space-x-2">
          <RadioGroupItem value={index.toString()} id={`q${id}-option-${index}`} />
          <Label htmlFor={`q${id}-option-${index}`} className="text-base">
            {option}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}
