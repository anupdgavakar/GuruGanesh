import { ResourceFormPage } from "@/components/resource/resource-form-page";

export default async function Page({ params }: { params: Promise<{ record: string }> }) {
  const { record } = await params;
  return <ResourceFormPage configKey="sliders" recordKeyValue={record} />;
}
