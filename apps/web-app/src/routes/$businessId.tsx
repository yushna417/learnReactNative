import React from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  Badge, Button, Spinner, Alert, DarkThemeToggle, Navbar,
} from "flowbite-react";
import {
  HiArrowLeft, HiPhone, HiMail, HiLocationMarker,
  HiExternalLink, HiOfficeBuilding, HiClock,
} from "react-icons/hi";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useGetListingById } from "../hooks/useBusinessListings";

export const Route = createFileRoute('/$businessId')({
  component: BusinessDetailPage,
})


// ─── Detail row ───────────────────────────────────────────────────────────────

function DetailRow({
  icon: Icon, label, value, href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="mt-0.5 w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">
          {label}
        </p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-amber-600 dark:text-amber-400 hover:underline break-all"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm text-gray-800 dark:text-gray-200 wrap-break-word">{value}</p>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function BusinessDetailPage() {
  const { businessId } = useParams({ from: "/$businessId" });
  const { data: listing, isLoading, isError } = useGetListingById(Number(businessId));

  const hasMap = listing?.latitude != null && listing?.longitude != null;
  const formattedDate = listing?.created_at
    ? new Date(listing.created_at).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    })
    : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">

      {/* ── Nav ────────────────────────────────────────────────────────── */}
      <Navbar fluid className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
        >
          <HiArrowLeft className="w-5 h-5" />
          <span className="font-medium text-sm">Back to listings</span>
        </Link>
        <div className="ml-auto">
          <DarkThemeToggle />
        </div>
      </Navbar>

      {/* ── Loading ────────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="xl" />
        </div>
      )}

      {/* ── Error ──────────────────────────────────────────────────────── */}
      {isError && (
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Alert color="failure">
            <span className="font-semibold">Could not load this business.</span>{" "}
            <Link to="/" className="underline">Browse all listings →</Link>
          </Alert>
        </div>
      )}

      {/* ── Content ────────────────────────────────────────────────────── */}
      {listing && (
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Left / main column ─────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Header card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
              {listing.business_category && (
                <Badge color="warning" className="mb-3 inline-block">
                  {listing.business_category}
                </Badge>
              )}
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
                {listing.title || "Untitled Business"}
              </h1>
              {listing.service_detail && (
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {listing.service_detail}
                </p>
              )}
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
                Contact & Location
              </h2>

              {listing.phone_no && (
                <DetailRow
                  icon={HiPhone}
                  label="Phone"
                  value={listing.phone_no}
                  href={`tel:${listing.phone_no}`}
                />
              )}
              {listing.email && (
                <DetailRow
                  icon={HiMail}
                  label="Email"
                  value={listing.email}
                  href={`mailto:${listing.email}`}
                />
              )}
              {listing.address && (
                <DetailRow
                  icon={HiLocationMarker}
                  label="Address"
                  value={listing.address}
                />
              )}
              {listing.location_url && (
                <DetailRow
                  icon={HiExternalLink}
                  label="Google Maps"
                  value="Open in Google Maps"
                  href={listing.location_url}
                />
              )}
              {formattedDate && (
                <DetailRow
                  icon={HiClock}
                  label="Listed on"
                  value={formattedDate}
                />
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-5">

            {/* Map card */}
            {hasMap ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <HiLocationMarker className="w-4 h-4 text-amber-500" />
                    Location
                  </h2>
                </div>
                <MapContainer
                  center={[listing.latitude!, listing.longitude!]}
                  zoom={15}
                  style={{ height: 300, width: "100%" }}
                  scrollWheelZoom={false}
                  zoomControl={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[listing.latitude!, listing.longitude!]}>
                    <Popup>
                      <strong>{listing.title}</strong>
                      {listing.address && <><br />{listing.address}</>}
                    </Popup>
                  </Marker>
                </MapContainer>

              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center shadow-sm">
                <HiOfficeBuilding className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  No map location available
                </p>
              </div>
            )}

            {listing.phone_no && (
              <a href={`tel:${listing.phone_no}`}>
                <Button color="warning" className="w-full" size="lg">
                  <HiPhone className="mr-2 h-5 w-5" />
                  Call {listing.phone_no}
                </Button>
              </a>
            )}
            {listing.email && (
              <a href={`mailto:${listing.email}`}>
                <Button color="light" className="w-full">
                  <HiMail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


