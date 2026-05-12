import { forwardRef } from "react";

interface DataTableProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTable({ children, className = "" }: DataTableProps) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-[#D8E0EA] bg-white shadow-sm ${className}`}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

interface DataTableHeadProps {
  children: React.ReactNode;
}

export function DataTableHead({ children }: DataTableHeadProps) {
  return (
    <thead className="border-b border-[#D8E0EA] bg-[#F6F8FB]">
      <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-[#475569]">
        {children}
      </tr>
    </thead>
  );
}

export function DataTableTh({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <th className={`px-4 py-3 ${className}`}>{children}</th>;
}

export function DataTableBody({ children }: { children: React.ReactNode }) {
  return (
    <tbody className="divide-y divide-[#E8EEF4] text-sm text-[#0F172A]">
      {children}
    </tbody>
  );
}

export const DataTableRow = forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(function DataTableRow({ children, className = "", ...rest }, ref) {
  return (
    <tr
      ref={ref}
      className={["transition-colors hover:bg-[#F6F8FB]/90", className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </tr>
  );
});
DataTableRow.displayName = "DataTableRow";

export function DataTableTd({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}
