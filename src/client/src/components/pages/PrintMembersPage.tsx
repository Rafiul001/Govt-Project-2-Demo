import { Button } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { PrinterIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { apiClient } from "../../api/apiClient";
import { API_URLS } from "../../api/apiUrls";
import { toMemberListSearchParams } from "../../api/listParams";
import { useBranches } from "../../hooks/useBranches";
import { useMemberCategories } from "../../hooks/useMemberCategories";
import { getApiErrorMessage } from "../../lib/apiError";
import { displayTitle } from "../../lib/displayTitle";
import type {
  TApiResponse,
  TMember,
  TMemberListParams,
  TPaginated,
} from "../../types";

/** Every member matching the filters, across all pages. */
async function fetchAllMembers(
  filters: Omit<TMemberListParams, "page" | "pageSize">,
): Promise<TMember[]> {
  const all: TMember[] = [];
  let page = 1;
  for (;;) {
    const res = await apiClient
      .get(API_URLS.MEMBER.LIST, {
        searchParams: toMemberListSearchParams({
          ...filters,
          page,
          pageSize: 100,
        }),
      })
      .json<TApiResponse<TPaginated<TMember>>>();
    all.push(...res.data.items);
    if (page >= res.data.totalPages) break;
    page += 1;
  }
  return all;
}

type TPrintMembersPageProps = {
  search?: string;
  branchName?: string;
  categoryId?: number;
};

/**
 * Print-optimized member list ("PDF download"): opened in its own tab from the
 * members page with the active filters, it fetches the WHOLE filtered list and
 * calls `window.print()` — the browser's print-to-PDF shapes Bengali text
 * correctly, which jsPDF-style generators cannot.
 */
export function PrintMembersPage({
  search,
  branchName,
  categoryId,
}: TPrintMembersPageProps) {
  const filters = { search, branchName, categoryId };
  const query = useQuery({
    queryKey: ["members", "print", filters] as const,
    queryFn: () => fetchAllMembers(filters),
  });
  const categoriesQuery = useMemberCategories();
  const branchesQuery = useBranches({ page: 1, pageSize: 100 });

  const categoryLabel = new Map(
    (categoriesQuery.data?.items ?? []).map((category) => [
      category.id,
      displayTitle(category.nameBn, category.nameEn),
    ]),
  );
  const branchLabel = new Map(
    (branchesQuery.data?.items ?? []).map((branch) => [
      branch.id,
      branch.name,
    ]),
  );

  // Open the print dialog once everything has loaded (small delay so fonts
  // and layout settle first).
  const printed = useRef(false);
  const ready =
    query.isSuccess && categoriesQuery.isSuccess && branchesQuery.isSuccess;
  useEffect(() => {
    if (!ready || printed.current) return;
    printed.current = true;
    const id = setTimeout(() => window.print(), 400);
    return () => clearTimeout(id);
  }, [ready]);

  if (query.isError) {
    return (
      <p className="p-8 text-red-600">{getApiErrorMessage(query.error)}</p>
    );
  }
  if (!ready) {
    return <p className="p-8 text-neutral-500">Preparing member list…</p>;
  }

  const members = query.data ?? [];
  const filterLine = [
    categoryId ? categoryLabel.get(categoryId) : null,
    branchName,
    search ? `"${search}"` : null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    // Forced light colors: this page exists to be printed.
    <div className="min-h-screen bg-white p-8 text-black">
      <div className="mb-4 flex items-start justify-between print:hidden">
        <p className="text-sm text-neutral-500">
          Use your browser's print dialog to save this list as a PDF.
        </p>
        <Button variant="primary" onPress={() => window.print()}>
          <PrinterIcon className="size-4" />
          Print
        </Button>
      </div>

      <header className="mb-6 space-y-1 text-center">
        <h1 className="text-2xl font-bold">সদস্য তালিকা / Member List</h1>
        {filterLine ? <p className="text-sm">{filterLine}</p> : null}
        <p className="text-xs text-neutral-500">
          {new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
          {" — "}
          {members.length} members
        </p>
      </header>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {[
              "#",
              "নাম / Name",
              "শ্রেণি",
              "পদবি",
              "ব্র্যাঞ্চ",
              "মোবাইল",
              "রক্তের গ্রুপ",
              "ডিসিপ্লিন",
              "যোগদান",
            ].map((header) => (
              <th
                key={header}
                className="border border-neutral-400 bg-neutral-100 px-2 py-1.5 text-left font-semibold"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.map((member, index) => (
            <tr key={member.id} className="break-inside-avoid">
              <td className="border border-neutral-400 px-2 py-1">
                {index + 1}
              </td>
              <td className="border border-neutral-400 px-2 py-1">
                {displayTitle(member.nameBn, member.nameEn)}
              </td>
              <td className="border border-neutral-400 px-2 py-1">
                {categoryLabel.get(member.categoryId) ?? ""}
              </td>
              <td className="border border-neutral-400 px-2 py-1">
                {member.designation ?? ""}
              </td>
              <td className="border border-neutral-400 px-2 py-1">
                {branchLabel.get(member.branchId) ?? ""}
              </td>
              <td className="border border-neutral-400 px-2 py-1">
                {member.mobile ?? ""}
              </td>
              <td className="border border-neutral-400 px-2 py-1">
                {member.bloodGroup ?? ""}
              </td>
              <td className="border border-neutral-400 px-2 py-1">
                {member.discipline ?? ""}
              </td>
              <td className="border border-neutral-400 px-2 py-1">
                {member.joiningDate ?? ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
