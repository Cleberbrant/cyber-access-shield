import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, User, AlertCircle } from "lucide-react";
import { StudentLogs } from "@/types/fraud-logs";
import { LogEventCard } from "./LogEventCard";
import { IPAddress } from "./IPAddress";

interface StudentLogCardProps {
  studentLogs: StudentLogs;
}

export function StudentLogCard({ studentLogs }: StudentLogCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="border-l-4 border-l-cyber-blue">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <User className="h-5 w-5 text-cyber-blue" />
              <div>
                <CardTitle className="text-lg">
                  {studentLogs.student_email}
                </CardTitle>
                {studentLogs.student_name && (
                  <p className="text-sm text-muted-foreground">
                    {studentLogs.student_name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {studentLogs.total_violations} violações
              </Badge>

              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          <div className="mt-2">
            <IPAddress ip={studentLogs.session_ip} />
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent>
            <div className="space-y-3">
              {studentLogs.logs.map((log) => (
                <LogEventCard key={log.id} log={log} />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
