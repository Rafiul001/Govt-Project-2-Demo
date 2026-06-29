import { Card } from "@heroui/react";
import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: ReactNode;
  icon: ReactNode;
};

/** Dashboard summary tile. */
export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <Card>
      <Card.Content className="flex items-center gap-4 p-5">
        <div className="rounded-xl bg-(--surface-secondary) p-3 text-(--accent)">
          {icon}
        </div>
        <div className="space-y-0.5">
          <p className="text-sm text-(--muted)">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </Card.Content>
    </Card>
  );
}
