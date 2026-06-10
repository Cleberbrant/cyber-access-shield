import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserFilter } from "@/types/user";

interface UserFiltersProps {
  filter: UserFilter;
  onFilterChange: (filter: UserFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function UserFilters({
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: UserFiltersProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Tabs de filtro */}
      <Tabs
        value={filter}
        onValueChange={(value) => onFilterChange(value as UserFilter)}
        className="shrink-0"
      >
        <TabsList className="h-9 bg-secondary/50">
          <TabsTrigger value="all" className="text-xs">
            Todos
          </TabsTrigger>
          <TabsTrigger value="admins" className="text-xs">
            Admins
          </TabsTrigger>
          <TabsTrigger value="students" className="text-xs">
            Alunos
          </TabsTrigger>
          <TabsTrigger value="inactive" className="text-xs">
            Inativos
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Input de busca */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 bg-secondary/50 pl-10"
        />
      </div>
    </div>
  );
}
