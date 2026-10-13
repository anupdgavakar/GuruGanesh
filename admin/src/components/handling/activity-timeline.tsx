import type { ActivityEntry } from "@/lib/api/types";
import { formatDate } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  new: "New",
  read: "Read",
  responded: "Responded",
  pending_review: "Pending review",
  confirmed: "Confirmed",
  processing: "Processing",
  completed: "Completed",
  cancelled: "Cancelled",
};

const label = (value: string | null) => (value ? (statusLabels[value] ?? value) : "—");

function Who({ entry }: { entry: ActivityEntry }) {
  if (!entry.user_name) return <span className="font-medium text-ink-900">Someone</span>;
  return (
    <>
      <span className="font-medium text-ink-900">{entry.user_name}</span>
      {entry.user_role ? <span className="text-ink-400"> ({entry.user_role})</span> : null}
    </>
  );
}

function describe(entry: ActivityEntry): React.ReactNode {
  switch (entry.action) {
    case "claimed":
      return (
        <>
          <Who entry={entry} /> opened it and took it
        </>
      );
    case "assigned":
      return (
        <>
          <Who entry={entry} /> assigned it to <span className="font-medium text-ink-900">{entry.to_value}</span>
          {entry.from_value ? <span className="text-ink-400"> (was {entry.from_value})</span> : null}
        </>
      );
    case "unassigned":
      return (
        <>
          <Who entry={entry} /> took {entry.from_value ?? "the handler"} off it — nobody is handling it now
        </>
      );
    case "status_changed":
      return (
        <>
          <Who entry={entry} /> changed the status from {label(entry.from_value)} to{" "}
          <span className="font-medium text-ink-900">{label(entry.to_value)}</span>
        </>
      );
    case "note":
      return (
        <>
          <Who entry={entry} /> added a note
        </>
      );
    default:
      return <Who entry={entry} />;
  }
}

/**
 * The history of one inquiry or order, oldest first: when it came in, who took
 * it, who changed what. The "came in" line is built from the record's own
 * date, so requests that arrived before this feature still start correctly.
 */
export function ActivityTimeline({
  receivedLabel,
  receivedAt,
  entries,
}: {
  receivedLabel: string;
  receivedAt: string;
  entries: ActivityEntry[];
}) {
  return (
    <ol className="relative flex flex-col gap-4 border-l border-ink-200 pl-5">
      <li className="relative">
        <span aria-hidden className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-ink-300 ring-4 ring-white" />
        <p className="text-sm text-ink-700">{receivedLabel}</p>
        <p className="text-xs text-ink-400">{formatDate(receivedAt)}</p>
      </li>

      {entries.map((entry) => (
        <li key={entry.id} className="relative">
          <span
            aria-hidden
            className={
              "absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-white " +
              (entry.action === "note" ? "bg-warning" : entry.action === "status_changed" ? "bg-success" : "bg-accent-500")
            }
          />
          <p className="text-sm text-ink-600">{describe(entry)}</p>
          {entry.note ? (
            <p className="mt-1.5 whitespace-pre-wrap rounded-lg bg-warning-bg/60 px-3 py-2 text-sm text-ink-900">{entry.note}</p>
          ) : null}
          <p className="text-xs text-ink-400">{formatDate(entry.created_at)}</p>
        </li>
      ))}
    </ol>
  );
}
