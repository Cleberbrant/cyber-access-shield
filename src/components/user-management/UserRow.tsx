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
  const rowClass = isCurrentUser ? "bg-muted/50" : "";

  return (
    <tr className={rowClass}>
      {/* Nome / Email */}
      <td className="px-4 py-3">
        <div>
          <p className="font-medium">
            {user.display_name || user.email.split("@")[0]}
            {isCurrentUser && (
              <Badge variant="outline" className="ml-2 text-xs">
                Você
              </Badge>
            )}
          </p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </td>

      {/* Tipo */}
      <td className="px-4 py-3">
        <Badge variant={user.is_admin ? "default" : "secondary"}>
          {user.is_admin ? "Admin" : "Aluno"}
        </Badge>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <Badge variant={user.is_active ? "outline" : "destructive"}>
          {user.is_active ? "Ativo" : "Inativo"}
        </Badge>
      </td>

      {/* Criado em */}
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatShortDate(user.created_at)}
      </td>

      {/* Último acesso */}
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatShortDate(user.last_sign_in_at)}
      </td>

      {/* Ações */}
      <td className="px-4 py-3">
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
