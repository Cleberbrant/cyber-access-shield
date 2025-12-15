import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IPAddress } from "./IPAddress";
import {
  formatEventType,
  formatTimestamp,
  getEventSeverity,
} from "@/utils/fraud-logs-utils";
import { AlertTriangle, Clock } from "lucide-react";
import { FraudLog } from "@/types/fraud-logs";

interface LogEventCardProps {
  log: FraudLog;
}

export function LogEventCard({ log }: LogEventCardProps) {
  const severity = getEventSeverity(log.event_type);

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-4 w-4 ${severity.color}`} />
            <span className="font-medium">
              {formatEventType(log.event_type)}
            </span>
          </div>
          <Badge variant={severity.badge} className="text-xs">
            {formatEventType(log.event_type)}
          </Badge>
        </div>

        {log.event_details && (
          <p className="text-sm text-muted-foreground mb-3">
            {log.event_details}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTimestamp(log.created_at)}
          </div>

          <IPAddress ip={log.ip_address} />
        </div>
      </CardContent>
    </Card>
  );
}
