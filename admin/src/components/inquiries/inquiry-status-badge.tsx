import { Badge } from "@/components/ui/badge";
import type { InquiryStatus } from "@/lib/api/types";

const toneByStatus: Record<InquiryStatus, "warning" | "neutral" | "success"> = {
  new: "warning",
  read: "neutral",
  responded: "success",
};

const labelByStatus: Record<InquiryStatus, string> = {
  new: "New",
  read: "Read",
  responded: "Responded",
};

export function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  return <Badge tone={toneByStatus[status]}>{labelByStatus[status]}</Badge>;
}
