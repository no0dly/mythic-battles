import LanguageSwitcher from "../components/LanguageSwitcher";
import ExampleTrpc from "@/components/ExampleTrpc";
import Header from "@/components/Header";

export default function Home() {
  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Mythic Battles
          </h1>
          <LanguageSwitcher />
          <div className="mt-6">
            <ExampleTrpc />
          </div>
        </div>
      </main>
    </>
  );
}
