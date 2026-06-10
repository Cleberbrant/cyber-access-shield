import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCog, GraduationCap, UserX } from "lucide-react";
import { UserStats } from "@/types/user";

interface UserStatsCardProps {
  stats: UserStats | null;
}

export function UserStatsCard({ stats }: UserStatsCardProps) {
  if (!stats) return null;

  const statItems = [
    {
      label: "Total",
      value: stats.total,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Admins",
      value: stats.admins,
      icon: UserCog,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Alunos",
      value: stats.students,
      icon: GraduationCap,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Inativos",
      value: stats.inactive,
      icon: UserX,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {statItems.map((item) => (
        <Card key={item.label} className="cyber-glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </p>
                <p className="font-display text-2xl font-bold mt-1.5">
                  {item.value}
                </p>
              </div>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-md ${item.bgColor}`}
              >
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
