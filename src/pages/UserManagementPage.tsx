import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SecureAppShell } from "@/components/secure-app-shell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, FileText } from "lucide-react";
import { isAdmin } from "@/utils/secure-utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Componentes
import { UserManagementHeader } from "@/components/user-management/UserManagementHeader";
import { UserStatsCard } from "@/components/user-management/UserStatsCard";
import { UserFilters } from "@/components/user-management/UserFilters";
import { UsersTable } from "@/components/user-management/UsersTable";
import { Pagination } from "@/components/user-management/Pagination";
import { UserEditDialog } from "@/components/user-management/UserEditDialog";
import { SelfEditDialog } from "@/components/user-management/SelfEditDialog";
import { ActivateButton } from "@/components/user-management/ActivateButton";
import { AuditLogsTab } from "@/components/user-management/AuditLogsTab";

// Hooks
import { useUsers } from "@/hooks/useUsers";
import { useUserStats } from "@/hooks/useUserStats";

// Types
import { User, UserFilter } from "@/types/user";

export default function UserManagementPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Estado de autenticação
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");

  // Estado de filtros e paginação
  const [filter, setFilter] = useState<UserFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 50;

  // Estado de dialogs
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selfEditDialogOpen, setSelfEditDialogOpen] = useState(false);

  // Hooks de dados
  const { users, totalPages, loading, refetch } = useUsers({
    filter,
    searchQuery,
    page,
    pageSize,
  });

  const {
    stats,
    loading: statsLoading,
    refetch: refetchStats,
  } = useUserStats();

  // Verificar se é admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      const adminStatus = await isAdmin();
      setIsUserAdmin(adminStatus);

      if (!adminStatus) {
        toast({
          title: "Acesso negado",
          description:
            "Apenas administradores podem acessar o gerenciamento de usuários.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      // Buscar ID do usuário atual
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }

      setCheckingAuth(false);
    };

    checkAdminStatus();
  }, [navigate, toast]);

  // Handlers
  const handleRefresh = () => {
    refetch();
    refetchStats();
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);

    // Se é o próprio usuário, abrir dialog de auto-edição
    if (user.id === currentUserId) {
      setSelfEditDialogOpen(true);
    } else {
      setEditDialogOpen(true);
    }
  };

  const handleSuccess = () => {
    refetch();
    refetchStats();
  };

  const handleFilterChange = (newFilter: UserFilter) => {
    setFilter(newFilter);
    setPage(1); // Resetar página ao mudar filtro
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1); // Resetar página ao buscar
  };

  // Loading
  if (checkingAuth) {
    return (
      <SecureAppShell>
        <div className="container py-8">
          <div className="flex items-center justify-center py-12">
            <span>Verificando permissões...</span>
          </div>
        </div>
      </SecureAppShell>
    );
  }

  if (!isUserAdmin) {
    return null;
  }

  return (
    <SecureAppShell>
      <div className="container py-8">
        {/* Botão Voltar */}
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Dashboard
        </Button>

        {/* Header */}
        <UserManagementHeader
          onRefresh={handleRefresh}
          isLoading={loading || statsLoading}
        />

        {/* Estatísticas */}
        <UserStatsCard stats={stats} />

        {/* Tabs: Usuários e Histórico */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Histórico de Alterações
            </TabsTrigger>
          </TabsList>

          {/* Tab Usuários */}
          <TabsContent value="users" className="space-y-6">
            {/* Filtros */}
            <UserFilters
              filter={filter}
              onFilterChange={handleFilterChange}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
            />

            {/* Tabela de Usuários */}
            <UsersTable
              users={users}
              currentUserId={currentUserId}
              loading={loading}
              onEdit={handleEdit}
            />

            {/* Paginação */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </TabsContent>

          {/* Tab Histórico */}
          <TabsContent value="history">
            <AuditLogsTab />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <UserEditDialog
          user={selectedUser}
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedUser(null);
          }}
          onSuccess={handleSuccess}
        />

        <SelfEditDialog
          user={selectedUser}
          open={selfEditDialogOpen}
          onClose={() => {
            setSelfEditDialogOpen(false);
            setSelectedUser(null);
          }}
          onSuccess={handleSuccess}
        />
      </div>
    </SecureAppShell>
  );
}
