
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface MatchingQuestionProps {
  matches: Array<{ left: string; right: string }>;
  value?: Record<string, string>;
  onChange: (leftItem: string, rightItem: string) => void;
}

export function MatchingQuestion({ matches, value = {}, onChange }: MatchingQuestionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Itens</Label>
          <div className="space-y-2">
            {matches.map((match, index) => (
              <Card key={`left-${index}`} className="border-dashed">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span>{match.left}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Correspondências</Label>
          <div className="space-y-2">
            {matches.map((match, index) => (
              <div key={`right-${index}`} className="relative">
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={value[matches[index].left] || ""}
                  onChange={(e) => onChange(matches[index].left, e.target.value)}
                >
                  <option value="">Selecione uma correspondência</option>
                  {matches.map((m, idx) => (
                    <option key={idx} value={m.right}>
                      {m.right}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
