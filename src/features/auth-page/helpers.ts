"use server"
import { createHash } from "crypto";
import { RedirectToPage } from "../common/navigation-helpers";
import { cookies } from 'next/headers';
import { getCookie } from 'cookies-next';

export const userSession = async (): Promise<UserModel | null> => {
  const cookiedata = getCookie('sessiondata', { cookies });
  const session = JSON.parse(cookiedata!);

  if (session && session.user) {
    return {
      name: session.user.name!,
      image: session.user.image!,
      email: session.user.email!,
      isAdmin: session.user.isAdmin!,
    };
  }

  return null;
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

export const hashValue = async (value: Promise<string> | string): Promise<string> => {
  const resolvedValue = await Promise.resolve(value); // Ensure the value is resolved if it's a Promise
  const hash = createHash("sha256");
  hash.update(resolvedValue);
  return hash.digest("hex");
};

export const redirectIfAuthenticated = async () => {
  const user = await userSession();
  if (user) {
    RedirectToPage("chat");
  }
};

export type UserModel = {
  name: string;
  image: string;
  email: string;
  isAdmin: boolean;
};
