import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserManagementLog } from "@/types/user";
import {
  formatDate,
  translateAction,
  formatLogValue,
} from "@/utils/user-utils";
import { User, Shield, Key, UserX, UserCheck, FileText } from "lucide-react";

interface AuditLogCardProps {
  log: UserManagementLog;
}

export function AuditLogCard({ log }: AuditLogCardProps) {
  const getActionIcon = () => {
    switch (log.action) {
      case "edit_role":
        return Shield;
      case "reset_password":
      case "self_password_change":
        return Key;
      case "deactivate":
        return UserX;
      case "activate":
        return UserCheck;
      default:
        return FileText;
    }
  };

  const getActionColor = () => {
    switch (log.action) {
      case "edit_role":
        return "text-accent bg-accent/10";
      case "reset_password":
      case "self_password_change":
        return "text-primary bg-primary/10";
      case "deactivate":
        return "text-destructive bg-destructive/10";
      case "activate":
        return "text-emerald-400 bg-emerald-500/10";
      default:
        return "text-muted-foreground bg-secondary";
    }
  };

  const ActionIcon = getActionIcon();

  return (
    <Card className="cyber-glass">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`rounded-md p-2 ${getActionColor()}`}>
            <ActionIcon className="h-4 w-4" />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold">
                  {translateAction(log.action)}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {formatDate(log.created_at)}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {translateAction(log.action)}
              </Badge>
            </div>

            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Admin:</span>{" "}
                <span className="text-muted-foreground">{log.admin_email}</span>
              </p>
              <p>
                <span className="font-medium">Usuário:</span>{" "}
                <span className="text-muted-foreground">
                  {log.target_user_email}
                </span>
              </p>

              {log.old_value && log.new_value && (
                <p>
                  <span className="font-medium">Alteração:</span>{" "}
                  <span className="text-muted-foreground">
                    {formatLogValue(log.action, log.old_value)}
                  </span>
                  {" → "}
                  <span className="text-foreground font-medium">
                    {formatLogValue(log.action, log.new_value)}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
