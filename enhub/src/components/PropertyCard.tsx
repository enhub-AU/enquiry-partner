"use client";

import { Property } from "@/types/enquiry";
import { Home, BedDouble, Bath, Car } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
}

const statusLabels: Record<Property["status"], { label: string; className: string }> = {
  available: { label: "Available", className: "bg-channel-sms/10 text-channel-sms" },
  under_offer: { label: "Under Offer", className: "bg-warm/10 text-warm" },
  sold: { label: "Sold", className: "bg-hot/10 text-hot" },
};

export function PropertyCard({ property }: PropertyCardProps) {
  const status = statusLabels[property.status];

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
          <Home className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-xs font-semibold">Property</h3>
          <span className={cn("text-[10px] font-medium rounded-full px-2 py-0.5", status.className)}>
            {status.label}
          </span>
        </div>
      </div>
      <p className="text-sm font-medium mb-1">{property.address}</p>
      <p className="text-sm font-semibold text-primary mb-3">{property.priceGuide}</p>
      {(property.bedrooms || property.bathrooms || property.parking) && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {property.bedrooms && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" /> {property.bedrooms}
            </span>
          )}
          {property.bathrooms && (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" /> {property.bathrooms}
            </span>
          )}
          {property.parking && (
            <span className="flex items-center gap-1">
              <Car className="h-3.5 w-3.5" /> {property.parking}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
