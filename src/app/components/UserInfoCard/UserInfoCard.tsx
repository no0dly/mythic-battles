import { useTranslation } from "react-i18next";
import FriendsList from "../FriendsList";

const userInfoMocked = [
  { label: "gamesPlayed", value: "24" },
  { label: "score", value: "12400" },
  { label: "favoriteGod", value: "Zeus" },
  { label: "lastDeck", value: "Lightning" },
];

function UserInfoCard() {
  const { t } = useTranslation();
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative border-2 border-foreground rounded-2xl p-3 md:p-4 bg-background transition-all duration-300">
        <div className="space-y-5">
          {userInfoMocked.map((item) => (
            <div
              key={item.label}
              className="flex justify-between items-center group/item"
            >
              <span className="text-foreground/70 font-medium">
                {t(item.label)}
              </span>
              <span className="font-semibold text-foreground">
                {item.value}
              </span>
            </div>
          ))}
          <FriendsList />
        </div>
      </div>
    </div>
  );
}

export default UserInfoCard;
