import React from "react";
import { Pagination, Select } from "flowbite-react";
import { PaginationMeta } from "../api/businessListings";
import { Action } from "../hooks/useBusinessSearch";


const PER_PAGE_OPTIONS = [10, 20, 30];

type BusinessListFooterProps = {
    pagination: PaginationMeta;
    perPage: number;
    isFetching: boolean;
    dispatch: React.Dispatch<Action>;
}

export function BusinessListFooter({
    pagination, perPage, dispatch,
}: BusinessListFooterProps) {
    const { page, total_pages, total, per_page } = pagination;
    const start = (page - 1) * per_page + 1;
    const end = Math.min(page * per_page, total);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-10 border-t border-gray-100 dark:border-gray-700">
            {/* Range + rows */}
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    Showing{" "}
                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                        {start}–{end}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{total}</span>{" "}
                    businesses
                </span>

                <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-400 whitespace-nowrap">Per page</label>
                    <Select
                        sizing="sm"
                        value={perPage}
                        onChange={(e) =>
                            dispatch({ type: "SET_PER_PAGE", value: Number(e.target.value) })
                        }
                        className="w-20"
                    >
                        {PER_PAGE_OPTIONS.map((n) => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </Select>
                </div>
            </div>

            <Pagination
                currentPage={page}style={{fontSize:'15px'}}
                totalPages={total_pages}
                onPageChange={(p) => dispatch({ type: "SET_PAGE", value: p })}
                showIcons
                theme={{
                    pages: {
                        selector: {
                            active: "bg-amber-500 text-white border-amber-500 hover:bg-amber-600 hover:text-white dark:bg-amber-500 dark:text-white",
                        },
                    },
                }}
            />
        </div>
    );
}