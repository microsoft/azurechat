import { createHash } from "crypto";
// import { getServerSession } from "next-auth";
// import { RedirectToPage } from "../common/navigation-helpers";
// import { options } from "./auth-api";

export const userSession = async (): Promise<UserModel | null> => {
  return {
    name: "Guest",
    image: "",
    email: "guest@domain.com",
    isAdmin: false,
  };
};

export const getCurrentUser = async (): Promise<UserModel> => {
  const user = await userSession();
  if (user) {
    return user;
  }
  throw new Error("User not found");
};

export const userHashedId = async (): Promise<string> => {
  const user = await userSession();
  if (user) {
    return hashValue(user.email);
  }
  throw new Error("User not found");
};

export const hashValue = (value: string): string => {
  const hash = createHash("sha256");
  hash.update(value);
  return hash.digest("hex");
};

export const redirectIfAuthenticated = async () => {
  // Remove authentication check and directly redirect to chat
  // Uncomment the line below if you have a redirect function defined
  // RedirectToPage("chat");
};

export type UserModel = {
  name: string;
  image: string;
  email: string;
  isAdmin: boolean;
};
