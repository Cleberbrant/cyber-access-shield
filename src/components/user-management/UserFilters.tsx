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
    <div className="space-y-4 mb-6">
      {/* Tabs de filtro */}
      <Tabs
        value={filter}
        onValueChange={(value) => onFilterChange(value as UserFilter)}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
          <TabsTrigger value="students">Alunos</TabsTrigger>
          <TabsTrigger value="inactive">Inativos</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Input de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}
