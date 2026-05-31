
import { Card, Badge } from "flowbite-react";
import { Link } from "@tanstack/react-router";
import {
    HiPhone, HiMail, HiLocationMarker, HiArrowRight,
} from "react-icons/hi";
import { BusinessListing } from "../api/businessListings";
import { GiPathDistance } from "react-icons/gi";

type BusinessCardProps = {
    listing: BusinessListing;
}

const CATEGORY_COLORS: Record<string, "info" | "success" | "warning" | "failure" | "purple"> = {
    "Restaurant": "warning",
    "Technology": "info",
    "Healthcare": "success",
    "Electronics Repair": "purple",
    "Education": "info",
    "Construction": "warning",
    "Real Estate": "success",
    "Entertainment": "purple",
};

function categoryColor(cat: string) {
    return CATEGORY_COLORS[cat] ?? "indigo";
}

export function BusinessCard({ listing }: BusinessCardProps) {
    const shortAddress = listing.address
        ? listing.address.split(",").slice(0, 2).join(",")
        : null;

    return (
        <Card className="group hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col dark:bg-gray-800 dark:border-gray-700">
            {listing.business_category && (
                <div className="flex items-center justify-between mb-2">
                    <Badge color={categoryColor(listing.business_category) as any} className="text-xs">
                        {listing.business_category}
                    </Badge>
                    {listing.distance_km !== null && (
                        <Badge color="indigo" className=" flex flex-row gap-2" size="lg" icon={GiPathDistance}>
                            <p className="text-xs font-semibold">
                                {listing.distance_km} km away
                            </p>
                        </Badge>
                    )}
                </div>
            )}

            {/* Title */}
            <h3 className="text-gray-900 dark:text-white font-bold text-lg leading-snug mb-1 line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {listing.title || "Untitled Business"}
            </h3>

            {listing.service_detail && (
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-2 mb-3 flex-1">
                    {listing.service_detail}
                </p>
            )}

            <div className="mt-auto space-y-2">
                {shortAddress && (
                    <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
                        <HiLocationMarker className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-xs truncate">{shortAddress}</span>
                    </div>
                )}

                <div className="flex items-center gap-3">
                    {listing.phone_no && (
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                            <HiPhone className="w-3.5 h-3.5" />
                            <span className="text-xs">{listing.phone_no}</span>
                        </div>
                    )}
                    {listing.email && (
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 min-w-0">
                            <HiMail className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-xs truncate">{listing.email}</span>
                        </div>
                    )}
                </div>

                <Link
                    to="/$businessId"
                    params={{ businessId: String(listing.id) }}
                    className="mt-3 flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-sm font-semibold transition-colors"
                >
                    View Details
                    <HiArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </Card>
    );
}