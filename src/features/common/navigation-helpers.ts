"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type Page = "extensions" | "persona" | "prompt" | "chat" | "settings";

export const RevalidateCache = async (props: {
  page: Page;
  params?: string | undefined;
  type?: "layout" | "page" | undefined;
}) => {
  const { page, params, type } = props;
  if (params) {
    await revalidatePath(`/${page}/${params}`, type);
  } else {
    await revalidatePath(`/${page}`, type);
  }
};

export const RedirectToPage = async (path: Page) => {
  redirect(`/${path}`);
};

export const RedirectToChatThread = async (chatThreadId: string) => {
  redirect(`/chat/${chatThreadId}`);
};