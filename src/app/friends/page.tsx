import { requireUser } from "@/lib/auth/requireUser";
import FriendsPage from "./components/FriendsPage";

export default async function FriendsRoutePage() {
  await requireUser();

  return <FriendsPage />;
}
