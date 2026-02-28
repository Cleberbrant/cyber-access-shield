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
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span>Carregando usuários...</span>
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Nenhum usuário encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Nome / Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Tipo</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Criado em
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Último Acesso
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
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
