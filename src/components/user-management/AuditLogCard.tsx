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
        return "text-purple-600 bg-purple-50 dark:bg-purple-950/20";
      case "reset_password":
      case "self_password_change":
        return "text-blue-600 bg-blue-50 dark:bg-blue-950/20";
      case "deactivate":
        return "text-red-600 bg-red-50 dark:bg-red-950/20";
      case "activate":
        return "text-green-600 bg-green-50 dark:bg-green-950/20";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-950/20";
    }
  };

  const ActionIcon = getActionIcon();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`rounded-full p-2 ${getActionColor()}`}>
            <ActionIcon className="h-5 w-5" />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{translateAction(log.action)}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(log.created_at)}
                </p>
              </div>
              <Badge variant="outline">{translateAction(log.action)}</Badge>
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
