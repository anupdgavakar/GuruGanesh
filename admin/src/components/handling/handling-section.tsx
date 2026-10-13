import { adminApiFetch } from "@/lib/api/client";
import { getCurrentUser } from "@/lib/api/auth";
import type { ActivityEntry, ApiListResponse, Handler } from "@/lib/api/types";
import { hasPermission } from "@/lib/permissions";
import { ActivityTimeline } from "./activity-timeline";
import { HandlerPanel } from "./handler-panel";
import { NoteForm } from "./note-form";
import type { HandlingKind } from "@/actions/handling-actions";

/**
 * "Who is handling this, and what has happened to it" — shared by the inquiry
 * and order pages. Server component: loads the list of people it can be handed
 * to (only for roles allowed to reassign).
 */
export async function HandlingSection({
  kind,
  id,
  assignee,
  assignedAt,
  createdAt,
  activities,
  receivedLabel,
}: {
  kind: HandlingKind;
  id: number;
  assignee: Handler | null | undefined;
  assignedAt: string | null | undefined;
  createdAt: string;
  activities: ActivityEntry[] | undefined;
  receivedLabel: string;
}) {
  const user = await getCurrentUser();

  let team: Handler[] | null = null;
  if (hasPermission(user, "assign")) {
    try {
      const res = await adminApiFetch<ApiListResponse<Handler>>(`/api/team?for=${kind}`);
      team = res.data;
    } catch {
      team = null;
    }
  }

  return (
    <div className="rounded-card border border-ink-200 bg-white p-5 shadow-card">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Handled by</h2>
      <div className="mt-3">
        <HandlerPanel kind={kind} id={id} assignee={assignee} assignedAt={assignedAt} team={team} />
      </div>

      <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-ink-500">History</h2>
      <div className="mt-3">
        <ActivityTimeline receivedLabel={receivedLabel} receivedAt={createdAt} entries={activities ?? []} />
      </div>

      <div className="mt-6 border-t border-ink-100 pt-4">
        <NoteForm kind={kind} id={id} />
      </div>
    </div>
  );
}
