import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuditLogFilter } from "@/types/user";

interface AuditLogFiltersProps {
  filter: AuditLogFilter;
  onFilterChange: (filter: AuditLogFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function AuditLogFilters({
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: AuditLogFiltersProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Tabs de filtro */}
      <Tabs
        value={filter}
        onValueChange={(value) => onFilterChange(value as AuditLogFilter)}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="edit_role">Tipo</TabsTrigger>
          <TabsTrigger value="reset_password">Senha</TabsTrigger>
          <TabsTrigger value="activation">Ativação</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Input de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar usuário por email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}
