import { adminApiFetch } from "@/lib/api/client";
import type { ApiResource, SiteSettings } from "@/lib/api/types";
import { SettingsForm } from "@/components/settings/settings-form";
import { HidePricesForm } from "@/components/settings/hide-prices-form";

async function fetchSettings(): Promise<SiteSettings> {
  const res = await adminApiFetch<ApiResource<SiteSettings>>("/api/settings");
  return res.data;
}

export default async function SettingsPage() {
  const settings = await fetchSettings();

  return (
    <div className="flex max-w-xl flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Site settings</h1>
        <p className="mt-1 text-sm text-ink-500">Small site-wide values that don&apos;t need a code change to update.</p>
      </div>

      <div className="rounded-card border border-ink-200 bg-white p-5 shadow-card">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Prices</h2>
        <p className="mt-1.5 text-sm text-ink-600">
          Choose whether customers see prices on the website or have to ask you first.
        </p>
        <HidePricesForm initial={Boolean(settings.hide_prices)} />
      </div>

      <div className="rounded-card border border-ink-200 bg-white p-5 shadow-card">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Design file submissions</h2>
        <p className="mt-1.5 text-sm text-ink-600">
          When a customer chooses to email their design file instead of uploading it, the storefront tells them to
          send it here.
        </p>
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
