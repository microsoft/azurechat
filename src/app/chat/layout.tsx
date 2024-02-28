import { ChatMenu } from "@/features/chat/chat-menu/chat-menu";
import { ChatMenuContainer } from "@/features/chat/chat-menu/chat-menu-container";
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
      <div className="grid grid-cols-6 overflow-hidden bg-card/100 h-full">
        <ChatMenuContainer>
          <ChatMenu />
        </ChatMenuContainer>
        {children}
      </div>
    </>
  );
};
