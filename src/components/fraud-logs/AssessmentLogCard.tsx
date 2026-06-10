import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, AlertTriangle } from "lucide-react";
import { AssessmentLogs } from "@/types/fraud-logs";
import { StudentLogCard } from "./StudentLogCard";

interface AssessmentLogCardProps {
  assessmentLogs: AssessmentLogs;
}

export function AssessmentLogCard({ assessmentLogs }: AssessmentLogCardProps) {
  return (
    <Card className="cyber-glass border-accent/20">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-display text-lg">
                {assessmentLogs.assessment_title}
              </CardTitle>
              <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {assessmentLogs.total_students_with_logs} aluno
                  {assessmentLogs.total_students_with_logs !== 1 ? "s" : ""}
                </div>
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {assessmentLogs.total_violations} violações
                </div>
              </div>
            </div>
          </div>

          <Badge
            variant="outline"
            className="shrink-0 bg-destructive/10 text-destructive border-destructive/20 font-mono text-xs"
          >
            {assessmentLogs.total_violations} eventos
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {assessmentLogs.students.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum log de fraude registrado para esta avaliação.
            </p>
          ) : (
            assessmentLogs.students.map((student) => (
              <StudentLogCard key={student.student_id} studentLogs={student} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
