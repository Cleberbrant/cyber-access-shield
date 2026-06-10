import { Card, CardContent } from "@/components/ui/card";
import { User } from "@/types/user";
import { UserRow } from "./UserRow";
import { Loader2 } from "lucide-react";

interface UsersTableProps {
  users: User[];
  currentUserId: string;
  loading: boolean;
  onEdit: (user: User) => void;
}

export function UsersTable({
  users,
  currentUserId,
  loading,
  onEdit,
}: UsersTableProps) {
  if (loading) {
    return (
      <Card className="cyber-glass">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span>Carregando usuários...</span>
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card className="cyber-glass">
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Nenhum usuário encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cyber-glass overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border bg-secondary/40">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Nome / Email
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Tipo
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Criado em
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Último Acesso
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                isCurrentUser={user.id === currentUserId}
                onEdit={onEdit}
              />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
