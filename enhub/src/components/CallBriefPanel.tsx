"use client";

import { CallBrief } from "@/types/enquiry";
import { Phone, DollarSign, Clock, Heart, Shield, MessageCircle, Lightbulb, Flame, ArrowRight } from "lucide-react";

interface CallBriefPanelProps {
  brief: CallBrief;
}

const briefFields = [
  { key: "budgetRange" as const, label: "Budget", icon: DollarSign },
  { key: "timeframe" as const, label: "Timeframe", icon: Clock },
  { key: "motivations" as const, label: "Motivations", icon: Heart },
  { key: "sensitivities" as const, label: "Sensitivities", icon: Shield },
];

export function CallBriefPanel({ brief }: CallBriefPanelProps) {
  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-md bg-primary/20 flex items-center justify-center">
          <Phone className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-xs font-semibold">Agent Call Brief</h3>
          <p className="text-[10px] text-muted-foreground">Hot lead — call recommended</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {briefFields.map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex gap-2">
            <Icon className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
              <p className="text-xs leading-relaxed capitalize">{brief[key]}</p>
            </div>
          </div>
        ))}

        <div className="border-t border-primary/20 pt-2.5 mt-3">
          <div className="flex gap-2 mb-2">
            <MessageCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Opening Line</p>
              <p className="text-xs leading-relaxed italic">"{brief.suggestedOpening}"</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Lightbulb className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Strategy</p>
              <p className="text-xs leading-relaxed">{brief.strategyAngle}</p>
            </div>
          </div>
        </div>

        {/* Why This Is Hot */}
        {brief.whyHot && brief.whyHot.length > 0 && (
          <div className="border-t border-primary/20 pt-2.5 mt-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Flame className="h-3.5 w-3.5 text-hot" />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-hot">Why This Is Hot</p>
            </div>
            <div className="space-y-2">
              {brief.whyHot.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <ArrowRight className="h-3 w-3 text-hot/70 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium">{item.signal}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{item.evidence}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
