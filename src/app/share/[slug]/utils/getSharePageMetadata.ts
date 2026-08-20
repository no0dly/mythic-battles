import type { Metadata } from "next";
import { SHARE_PAGE_DESCRIPTION, SHARE_PAGE_TITLE } from "../constants";

export const getSharePageMetadata = (): Metadata => ({
  title: SHARE_PAGE_TITLE,
  description: SHARE_PAGE_DESCRIPTION,
  openGraph: {
    title: SHARE_PAGE_TITLE,
    description: SHARE_PAGE_DESCRIPTION,
  },
});
