import { customAlphabet } from "nanoid";

import { ChatThreadModel } from "../chat-page/chat-services/models";

export const uniqueId = () => {
  const alphabet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const nanoid = customAlphabet(alphabet, 36);
  return nanoid();
};

export const sortByTimestamp = (a: ChatThreadModel, b: ChatThreadModel) => {
  return (
    new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
};

/**
 * Pull a first name out of a directory display name, for greeting someone.
 *
 * Entra hands back several shapes depending on how the account was created:
 * "Steen, Jonathan Edward (Campus)" — surname first, which is why splitting on
 * the first space alone yields "Steen,". Also handles "Jon Steen (Azure)",
 * a plain "Jon", and a bare username.
 */
export const firstNameFromDisplayName = (
  displayName: string | null | undefined
): string => {
  if (!displayName) return "";

  // Drop a trailing qualifier such as "(Campus)" or "(Azure)".
  const withoutQualifier = displayName.replace(/\s*\([^)]*\)\s*$/, "").trim();
  if (withoutQualifier.length === 0) return "";

  // "Surname, Given Middle" — the given name follows the comma.
  const givenNames = withoutQualifier.includes(",")
    ? withoutQualifier.slice(withoutQualifier.indexOf(",") + 1)
    : withoutQualifier;

  return givenNames.trim().split(/\s+/)[0] ?? "";
};
