import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  TextInput, Button, Badge, Spinner, Alert,
  Dropdown, DarkThemeToggle, Navbar,
  DropdownItem,
  NavbarBrand,
} from "flowbite-react";
import {
  HiSearch, HiAdjustments, HiLocationMarker,
  HiPlus, HiX, HiSortAscending,
} from "react-icons/hi";
import { BusinessFilterDrawer, SORT_OPTIONS } from "../components/BusinessFilterDrawer";
import { BusinessCard } from "../components/BusinessCard";
import { BusinessListFooter } from "../components/Businesslistfooter";
import { useBusinessSearch } from "../hooks/useBusinessSearch";
import { useGetAllListings } from "../hooks/useBusinessListings";



// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/")({
  component: BusinessListingsPage,
});

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="text-6xl mb-5">🔍</span>
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
        No businesses found
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
        Try adjusting your search terms or clearing the filters.
      </p>
      <Button color="warning" onClick={onClear}>
        Clear Filters
      </Button>
    </div>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
      <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg mt-4" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function BusinessListingsPage() {
  const {
    state, dispatch, apiParams,
    activeFilterCount, requestGPSLocation, geocodeAddress,
  } = useBusinessSearch();

  const { data, isLoading, isError, refetch, isFetching } =
    useGetAllListings(apiParams);

  const listings = data?.listings ?? [];
  const pagination = data?.pagination ?? null;

  const clearAll = () => dispatch({ type: "CLEAR_FILTERS" });

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === state.sortBy)?.label ?? "Sort";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">

      <Navbar fluid className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <NavbarBrand as={Link} >
          <p className="text-xl font-black text-amber-950 dark:text-white tracking-tight">
            Digital <span className="text-amber-500">
              Yellow Paper
            </span>
          </p>
        </NavbarBrand>
        <div className="flex items-center gap-3 ml-auto">
          <DarkThemeToggle />
          <Link to="/">
            <Button color="yellow" size="sm">
              <HiPlus className="mr-1.5 h-4 w-4" />
              Add Business
            </Button>
          </Link>
        </div>
      </Navbar>

      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-1">
            Local Businesses
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Discover and connect with businesses in your area
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            {/* Search input */}
            <div className="flex-1">
              <TextInput
                icon={HiSearch}
                placeholder="Search by name, category, or keyword…"
                value={state.searchInput}
                onChange={(e) =>
                  dispatch({ type: "SET_SEARCH_INPUT", value: e.target.value })
                }
                rightIcon={
                  state.searchInput
                    ? () => (
                      <button
                        type="button"
                        onClick={() => dispatch({ type: "SET_SEARCH_INPUT", value: "" })}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <HiX className="w-4 h-4" />
                      </button>
                    )
                    : undefined
                }
                sizing="md"
              />
            </div>

            <Button
              color={activeFilterCount > 0 ? "warning" : "light"}
              onClick={() => dispatch({ type: "TOGGLE_FILTERS", value: true })}
              className="shrink-0"
            >
              <HiAdjustments className="mr-2 h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge color="failure" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>

            <Dropdown
              label={
                <span className="flex items-center gap-2">
                  <HiSortAscending className="h-4 w-4" />
                  {currentSortLabel}
                </span>
              }
              color="light"
              dismissOnClick
            >
              {SORT_OPTIONS.map((opt) => (
                <DropdownItem
                  key={opt.value}
                  onClick={() => dispatch({ type: "SET_SORT", value: opt.value })}
                  className={
                    state.sortBy === opt.value
                      ? "font-semibold text-amber-600 dark:text-amber-400"
                      : ""
                  }
                >
                  {opt.label}
                  {state.sortBy === opt.value && " ✓"}
                </DropdownItem>
              ))}
            </Dropdown>
          </div>

          {(activeFilterCount > 0 || state.searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {state.category !== "All" && (
                <Badge
                  color="warning"
                  className="cursor-pointer"
                  onClick={() => dispatch({ type: "SET_CATEGORY", value: "All" })}
                >
                  {state.category} ✕
                </Badge>
              )}
              {state.radiusKm !== null && (
                <Badge
                  color="info"
                  icon={HiLocationMarker}
                  className="cursor-pointer"
                  onClick={() => dispatch({ type: "SET_RADIUS", value: null })}
                >
                  {state.radiusKm} km
                  {state.locationLabel ? ` · ${state.locationLabel}` : ""}
                  {" ✕"}
                </Badge>
              )}
              {state.searchQuery && (
                <Badge
                  color="gray"
                  className="cursor-pointer"
                  onClick={() => {
                    dispatch({ type: "SET_SEARCH_INPUT", value: "" });
                    dispatch({ type: "COMMIT_SEARCH", value: "" });
                  }}
                >
                  "{state.searchQuery}" ✕
                </Badge>
              )}
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-gray-400 hover:text-red-500 underline transition-colors ml-1"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">

        <div className="flex items-center gap-2 mb-5">
          {isFetching && !isLoading && <Spinner size="sm" />}
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {isLoading
              ? "Loading…"
              : `${pagination?.total ?? listings.length} ${(pagination?.total ?? listings.length) === 1
                ? "business"
                : "businesses"
              } found${state.radiusKm && state.locationLabel
                ? ` within ${state.radiusKm} km of ${state.locationLabel}`
                : ""
              }`}
          </span>
        </div>

        {isError && (
          <Alert color="failure" className="mb-6">
            <span className="font-semibold">Failed to load businesses.</span>{" "}
            Check your connection.{" "}
            <button
              type="button"
              onClick={() => refetch()}
              className="underline font-medium"
            >
              Retry
            </button>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState onClear={clearAll} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-5">
            {listings.map((listing) => (
              <BusinessCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {pagination && !isLoading && listings.length > 0 && (
          <BusinessListFooter
            pagination={pagination}
            perPage={state.perPage}
            isFetching={isFetching}
            dispatch={dispatch}
          />
        )}
      </main>

      <BusinessFilterDrawer
        state={state}
        dispatch={dispatch}
        onRequestGPS={requestGPSLocation}
        onGeocodeAddress={geocodeAddress}
        onClearAll={clearAll}
      />
    </div>
  );
}


