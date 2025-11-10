import { DraftSettings } from "./database.types";

export type DraftPoolConfig = Omit<DraftSettings, "user_allowed_points">;

