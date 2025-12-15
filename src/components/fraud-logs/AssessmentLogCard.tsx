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
    <Card className="border-2 border-cyber-purple/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-cyber-purple" />
            <div>
              <CardTitle className="text-xl">
                {assessmentLogs.assessment_title}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {assessmentLogs.total_students_with_logs} aluno
                  {assessmentLogs.total_students_with_logs !== 1 ? "s" : ""}
                </div>
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  {assessmentLogs.total_violations} violações
                </div>
              </div>
            </div>
          </div>

          <Badge
            variant="outline"
            className="bg-destructive/10 text-destructive border-destructive/20"
          >
            {assessmentLogs.total_violations} eventos
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
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
