"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import FriendsListForm from "@/app/friends/components/FriendsListForm";
import FriendsTab from "@/app/friends/components/FriendsTab";
import IncomingTab from "@/app/friends/components/IncomingTab";
import SentTab from "@/app/friends/components/SentTab";
import { usePendingRequests, useSentRequests } from "@/hooks";
import { TAB_VALUES, type TabValuesType } from "./constants";
import styles from "./FriendsPage.module.css";

export default function FriendsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabValuesType>(TAB_VALUES.FRIENDS);
  const { pendingRequests } = usePendingRequests();
  const { sentRequests } = useSentRequests();
  const incomingCount = pendingRequests.length;
  const sentCount = sentRequests.length;

  function handleFriendsTabClick() {
    setActiveTab(TAB_VALUES.FRIENDS);
  }

  function handleIncomingTabClick() {
    setActiveTab(TAB_VALUES.INCOMING);
  }

  function handleSentTabClick() {
    setActiveTab(TAB_VALUES.SENT);
  }

  return (
    <div className={styles.Page}>
      <div className={styles.Shell}>
        <header className={styles.Hero}>
          <h1 className={styles.Title}>
            <span className={styles.TitleMark}>{t("friends")}</span>
          </h1>
          <p className={styles.Subtitle}>{t("friendsPageSubtitle")}</p>
        </header>

        <div className={styles.Layout}>
          <aside className={styles.Panel}>
            <div className={styles.PanelHeader}>
              <h2 className={styles.PanelTitle}>{t("friendsInviteTitle")}</h2>
              <p className={styles.PanelHint}>{t("friendsInviteHint")}</p>
            </div>
            <div className={styles.PanelBody}>
              <FriendsListForm />
            </div>
          </aside>

          <section className={`${styles.Panel} ${styles.RosterPanel}`}>
            <div className={styles.PanelHeader}>
              <h2 className={styles.PanelTitle}>{t("friendsRosterTitle")}</h2>
              <p className={styles.PanelHint}>{t("friendsRosterHint")}</p>
            </div>
            <div className={styles.PanelBody}>
              <div className={styles.TabsList} role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === TAB_VALUES.FRIENDS}
                  data-active={activeTab === TAB_VALUES.FRIENDS}
                  className={styles.Tab}
                  onClick={handleFriendsTabClick}
                >
                  {t("friends")}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === TAB_VALUES.INCOMING}
                  data-active={activeTab === TAB_VALUES.INCOMING}
                  className={styles.Tab}
                  onClick={handleIncomingTabClick}
                >
                  {t("friendRequests")}
                  {incomingCount > 0 && (
                    <span
                      className={`${styles.TabBadge} ${styles.TabBadgeIncoming}`}
                    >
                      {incomingCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === TAB_VALUES.SENT}
                  data-active={activeTab === TAB_VALUES.SENT}
                  className={styles.Tab}
                  onClick={handleSentTabClick}
                >
                  {t("sentRequests")}
                  {sentCount > 0 && (
                    <span
                      className={`${styles.TabBadge} ${styles.TabBadgeSent}`}
                    >
                      {sentCount}
                    </span>
                  )}
                </button>
              </div>

              <div className={styles.RosterContent}>
                {activeTab === TAB_VALUES.FRIENDS && <FriendsTab />}
                {activeTab === TAB_VALUES.INCOMING && <IncomingTab />}
                {activeTab === TAB_VALUES.SENT && <SentTab />}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
