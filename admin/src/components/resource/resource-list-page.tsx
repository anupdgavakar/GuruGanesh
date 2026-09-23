import { getResourceConfig } from "@/lib/resources/configs";
import { ResourceTable } from "./resource-table";

export function ResourceListPage({ configKey }: { configKey: string }) {
  const config = getResourceConfig(configKey);
  return <ResourceTable config={config} />;
}
