import PageLayout from "@/components/PageLayout";
import LanguageSwitcher from "../components/LanguageSwitcher";
import ExampleTrpc from "@/components/ExampleTrpc";

export default function Home() {
  return (
    <PageLayout title="wiki">
      <LanguageSwitcher />
      <div className="mt-6">
        <ExampleTrpc />
      </div>
    </PageLayout>
  );
}
