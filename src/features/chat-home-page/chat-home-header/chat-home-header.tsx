"use client";
import { AI_NAME, CHAT_DEFAULT_PERSONA } from "@/features/theme/theme-config";
import { FC } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

export const ChatHomeHeader: FC = () => {
  const { theme } = useTheme();
  const persona = CHAT_DEFAULT_PERSONA;
  
  return (
    <div className="bg-background border-b flex items-center py-2">
      <div className="container max-w-3xl flex justify-between items-center">
        <div className="flex flex-col">
          <div className="grid grid-rows-2 grid-flow-col gap-5 items-center">
            <div className="row-span-2">
              <Image
                src={theme === 'dark' ? "/aico-white.png" : "/aico-blue.png"}
                alt={AI_NAME}
                width={100}
                height={100}
              />
            </div>
            <div className="row-span-3">
              <span style={{ fontWeight: 'bold', fontSize: '30px' }}>
                {persona} (AI for Comau)
              </span>
              <div style={{ height: '10px' }}></div>
              <span className="flex flex-col" style={{ fontSize: '15px'}}>Start a new conversation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
