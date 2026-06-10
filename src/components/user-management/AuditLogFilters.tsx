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
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Tabs de filtro */}
      <Tabs
        value={filter}
        onValueChange={(value) => onFilterChange(value as AuditLogFilter)}
        className="shrink-0"
      >
        <TabsList className="h-9 bg-secondary/50">
          <TabsTrigger value="all" className="text-xs">
            Todas
          </TabsTrigger>
          <TabsTrigger value="edit_role" className="text-xs">
            Tipo
          </TabsTrigger>
          <TabsTrigger value="reset_password" className="text-xs">
            Senha
          </TabsTrigger>
          <TabsTrigger value="activation" className="text-xs">
            Ativação
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Input de busca */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar usuário por email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 bg-secondary/50 pl-10"
        />
      </div>
    </div>
  );
}
