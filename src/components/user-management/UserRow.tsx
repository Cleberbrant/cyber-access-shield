import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Lock } from "lucide-react";
import { User } from "@/types/user";
import { formatShortDate } from "@/utils/user-utils";

interface UserRowProps {
  user: User;
  isCurrentUser: boolean;
  onEdit: (user: User) => void;
}

export function UserRow({ user, isCurrentUser, onEdit }: UserRowProps) {
  const rowClass = isCurrentUser ? "bg-secondary/30" : "";

  return (
    <tr className={`transition-colors hover:bg-secondary/40 ${rowClass}`}>
      {/* Nome / Email */}
      <td className="px-4 py-2.5">
        <div>
          <p className="text-sm font-medium">
            {user.display_name || user.email.split("@")[0]}
            {isCurrentUser && (
              <Badge
                variant="outline"
                className="ml-2 border-primary/30 text-xs text-primary"
              >
                Você
              </Badge>
            )}
          </p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </td>

      {/* Tipo */}
      <td className="px-4 py-2.5">
        <Badge
          variant="outline"
          className={
            user.is_admin
              ? "border-accent/20 bg-accent/15 text-accent"
              : "border-primary/20 bg-primary/15 text-primary"
          }
        >
          {user.is_admin ? "Admin" : "Aluno"}
        </Badge>
      </td>

      {/* Status */}
      <td className="px-4 py-2.5">
        <Badge
          variant="outline"
          className={
            user.is_active
              ? "border-border/60"
              : "border-transparent bg-muted text-muted-foreground"
          }
        >
          {user.is_active ? "Ativo" : "Inativo"}
        </Badge>
      </td>

      {/* Criado em */}
      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
        {formatShortDate(user.created_at)}
      </td>

      {/* Último acesso */}
      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
        {formatShortDate(user.last_sign_in_at)}
      </td>

      {/* Ações */}
      <td className="px-4 py-2.5">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onEdit(user)}
          className="flex items-center gap-2"
        >
          {isCurrentUser ? (
            <>
              <Lock className="h-4 w-4" />
              Editar
            </>
          ) : (
            <>
              <Edit className="h-4 w-4" />
              Editar
            </>
          )}
        </Button>
      </td>
    </tr>
  );
}
