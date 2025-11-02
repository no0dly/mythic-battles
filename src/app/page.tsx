import PageLayout from "@/components/PageLayout";
import { createClient } from "@/lib/supabase/server";
import NotLoggedContent from "./components/NotLoggedContent";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <PageLayout>{user ? <div /> : <NotLoggedContent />}</PageLayout>;
}
