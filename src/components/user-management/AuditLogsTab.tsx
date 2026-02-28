import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { AuditLogCard } from "./AuditLogCard";
import { AuditLogFilters } from "./AuditLogFilters";
import { Pagination } from "./Pagination";
import { AuditLogFilter } from "@/types/user";

export function AuditLogsTab() {
  const [filter, setFilter] = useState<AuditLogFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const pageSize = 20;

  const { logs, totalPages, loading } = useAuditLogs({
    filter,
    searchQuery,
    page,
    pageSize,
  });

  return (
    <div>
      <AuditLogFilters
        filter={filter}
        onFilterChange={(newFilter) => {
          setFilter(newFilter);
          setPage(1); // Resetar página ao mudar filtro
        }}
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query);
          setPage(1); // Resetar página ao buscar
        }}
      />

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <span>Carregando histórico...</span>
          </CardContent>
        </Card>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Nenhum registro encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {logs.map((log) => (
              <AuditLogCard key={log.id} log={log} />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
