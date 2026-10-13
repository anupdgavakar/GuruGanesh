"use client";

import { useTransition } from "react";
import { deleteInquiryAction, updateInquiryStatusAction } from "@/actions/inquiry-actions";
import type { ContactInquiry, InquiryStatus } from "@/lib/api/types";
import { Button } from "@/components/ui/button";

const statuses: InquiryStatus[] = ["new", "read", "responded"];

export function InquiryActions({ inquiry, canDelete }: { inquiry: ContactInquiry; canDelete: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {statuses.map((status) => (
        <Button
          key={status}
          variant={inquiry.status === status ? "primary" : "secondary"}
          size="sm"
          disabled={pending}
          onClick={() => startTransition(() => updateInquiryStatusAction(inquiry.id, status))}
        >
          Mark {status}
        </Button>
      ))}
      {canDelete ? (
        <Button
          variant="danger"
          size="sm"
          disabled={pending}
          onClick={() => {
            if (!window.confirm("Delete this inquiry? This can't be undone.")) return;
            startTransition(() => deleteInquiryAction(inquiry.id));
          }}
        >
          Delete
        </Button>
      ) : null}
    </div>
  );
}
