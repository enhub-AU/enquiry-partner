"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Organisation {
  id: string;
  name: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Organisation[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/organisations")
      .then((res) => res.json())
      .then((data) => {
        setOrgs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleContinue = async () => {
    if (!selectedOrgId) return;
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ org_id: selectedOrgId }),
      });

      if (res.ok) {
        router.push("/dashboard");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md mx-4"
      >
        <div className="text-center mb-10">
          <div className="h-14 w-14 rounded-2xl bg-foreground flex items-center justify-center mx-auto mb-6">
            <Building2 className="h-7 w-7 text-background" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
            Select your agency
          </h1>
          <p className="text-sm text-muted-foreground/60">
            Choose the organisation you belong to.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-2 mb-8">
            {orgs.map((org) => (
              <button
                key={org.id}
                onClick={() => setSelectedOrgId(org.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-colors duration-150 text-left ${
                  selectedOrgId === org.id
                    ? "border-foreground/20 bg-muted/30"
                    : "border-border/30 hover:bg-muted/15"
                }`}
              >
                <div className="h-10 w-10 rounded-lg bg-muted/60 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-4 w-4 text-foreground/50" />
                </div>
                <span className="text-[14px] font-medium text-foreground flex-1">
                  {org.name}
                </span>
                {selectedOrgId === org.id && (
                  <ChevronRight className="h-4 w-4 text-foreground/50" />
                )}
              </button>
            ))}

            {orgs.length === 0 && (
              <p className="text-center text-sm text-muted-foreground/50 py-8">
                No organisations available. Contact your administrator.
              </p>
            )}
          </div>
        )}

        <Button
          onClick={handleContinue}
          disabled={!selectedOrgId || saving}
          className="w-full h-11 text-[14px] font-semibold"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Continue"
          )}
        </Button>
      </motion.div>
    </div>
  );
}
