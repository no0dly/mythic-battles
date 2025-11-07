import PageLayout from "@/components/PageLayout";
import DraftSettings from "./components/DraftSettings/DraftSettings";
import { requireUser } from "@/lib/auth/requireUser";

export default async function DraftSettingsPage() {
  await requireUser();

  return (
    <PageLayout title="draftSettings">
      <DraftSettings />
    </PageLayout>
  );
}
