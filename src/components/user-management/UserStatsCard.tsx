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
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Admins",
      value: stats.admins,
      icon: UserCog,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Alunos",
      value: stats.students,
      icon: GraduationCap,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Inativos",
      value: stats.inactive,
      icon: UserX,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statItems.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-3xl font-bold mt-2">{item.value}</p>
              </div>
              <div className={`rounded-full p-3 ${item.bgColor}`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
