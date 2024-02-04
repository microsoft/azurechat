"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type Page = "extensions" | "persona" | "prompt" | "chat" | "settings";

export const RevalidateCache = (props: {
  page: Page;
  params?: string | undefined;
  type?: "layout" | "page" | undefined;
}) => {
  const { page, params, type } = props;
  if (params) {
    revalidatePath(`/${page}/${params}`, type);
  } else {
    revalidatePath(`/${page}`, type);
  }
};

export const RedirectToPage = (path: Page) => {
  redirect(`/${path}`);
};

export const RedirectToChatThread = (chatThreadId: string) => {
  redirect(`/chat/${chatThreadId}`);
};
