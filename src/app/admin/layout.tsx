import { AdminMenu } from "@/features/admin/admin-menu/admin-menu";
import { ChatMenu } from "@/features/chat/chat-menu/chat-menu";
import { ChatMenuContainer } from "@/features/chat/chat-menu/chat-menu-container";
import { MainMenu } from "@/features/main-menu/menu";
import { AI_NAME } from "@/features/theme/customise";

export const dynamic = "force-dynamic";

export const metadata = {
  title: AI_NAME,
  description: AI_NAME,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MainMenu />
      <div className="flex-1 flex rounded-md overflow-hidden bg-card/70">
        <ChatMenuContainer>
          <AdminMenu />
        </ChatMenuContainer>
        {children}
      </div>
    </>
  );
}
