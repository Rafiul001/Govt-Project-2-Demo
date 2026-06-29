import { Table } from "@heroui/react";
import type { ReactNode } from "react";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  isRowHeader?: boolean;
  render: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  ariaLabel: string;
  columns: DataTableColumn<T>[];
  rows: T[];
};

/** Thin generic wrapper over HeroUI's table for static, already-paged rows. */
export function DataTable<T extends { id: number }>({
  ariaLabel,
  columns,
  rows,
}: DataTableProps<T>) {
  return (
    <Table>
      <Table.ScrollContainer className="rounded-xl border border-border">
        <Table.Content aria-label={ariaLabel}>
          <Table.Header>
            {columns.map((column) => (
              <Table.Column
                key={column.key}
                id={column.key}
                isRowHeader={column.isRowHeader}
              >
                {column.header}
              </Table.Column>
            ))}
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row key={row.id} id={row.id}>
                {columns.map((column) => (
                  <Table.Cell key={column.key}>{column.render(row)}</Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
