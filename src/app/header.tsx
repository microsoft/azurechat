import React from 'react';
import { QgovSvg } from '@/components/ui/qldgovlogo';
import { QgovMiniSvg } from '@/components/ui/qldgovminilogo';
import Typography from "@/components/typography";
import { UserComponent } from '@/components/ui/user-login-logout';
import { MiniMenu } from '@/features/main-menu/mini-menu';
import { AI_NAME } from "@/features/theme/customise";


const Sidebar: React.FC = () => {
    return (
        <div className="grid grid-cols-12 md:grid-cols-6 gap-2 items-center h-full">
            <div className="col-span-2 md:col-span-2 hidden md:block border-r-2 border-accent md:scale-75">
                <QgovSvg />
            </div>
            <div className="col-span-4 md:col-span-3 flex flex-col">
            <Typography variant="h1" className="text-siteTitle custom-title">{AI_NAME}</Typography>
            <Typography variant="h2" className="text-textMuted custom-subtitle pb-0 whitespace-nowrap hidden sm:block">The Queensland Government AI Assistant</Typography>
            </div>
            <div className="col-span-6 md:col-span-1 hidden md:block"></div>
        </div>
    );
};


export const Header: React.FC = () => {
    return (
        <div className="header-content h-full">
            <div className="bg-darkbackground text-white h-full sm:h-3/6 md:h-2/6">
                <div className="mx-auto flex justify-between items-center h-full">
                    <div className="block md:hidden lg:hidden scale">
                        <QgovMiniSvg />
                    </div>
                    <div className="container mx-auto hidden md:grid grid-cols-3 w-full items-center">
                        <Typography variant="span" aria-label="Site domain: qchat.ai.qld.gov.au" className="col-span-2">qchat.ai.qld.gov.au</Typography>
                        <div className="justify-self-end">
                            <UserComponent />
                        </div>
                    </div>
                    <div className="block md:hidden grid-cols-4 flex-col h-full ">
                        <MiniMenu />
                    </div>
                </div>
            </div>
            <div className="bg-altBackground py-2 foreground h-3/6 md:h-4/6 hidden sm:block">
                <div className="container mx-auto flex items-center">
                    <Sidebar />
                </div>
            </div>
        </div>
    );
};
