import { Table } from "@heroui/react";
import type { ReactNode } from "react";

export type TDataTableColumn<T> = {
  key: string;
  header: string;
  isRowHeader?: boolean;
  render: (row: T) => ReactNode;
};

type TDataTableProps<T> = {
  ariaLabel: string;
  columns: TDataTableColumn<T>[];
  rows: T[];
};

/**
 * Thin generic wrapper over HeroUI's table for static, already-paged rows.
 *
 * A table cannot reflow below the width its columns need, so on narrow screens
 * the only sane behaviour is to scroll it sideways. `overflow-x-auto` plus
 * `max-w-full` makes the container do that; without them the table simply grew
 * past the viewport and its right-hand columns (including the row actions)
 * were unreachable on a phone.
 */
export function DataTable<T extends { id: number }>({
  ariaLabel,
  columns,
  rows,
}: TDataTableProps<T>) {
  return (
    <Table>
      <Table.ScrollContainer className="max-w-full overflow-x-auto rounded-xl border border-border">
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
