import PageLayout from "@/components/PageLayout";
import DraftPageContent from "./DraftPageContent";
import { requireUser } from "@/lib/auth/requireUser";

export default async function DraftPage() {
  await requireUser();

  return (
    <PageLayout title="draft">
      <DraftPageContent />
    </PageLayout>
  );
}
