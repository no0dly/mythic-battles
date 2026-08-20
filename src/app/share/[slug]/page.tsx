import PageLayout from "@/components/PageLayout";
import SharedDraftContent from "./components/SharedDraftContent/SharedDraftContent";
import type { SharePageProps } from "./types";

export { getSharePageMetadata as generateMetadata } from "./utils/getSharePageMetadata";

export default async function SharePage({ params }: SharePageProps) {
  const { slug } = await params;

  return (
    <PageLayout title="sharedDrafts">
      <SharedDraftContent slug={slug} />
    </PageLayout>
  );
}
