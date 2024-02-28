"use client";

import React from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { LogIn, LogOut } from 'lucide-react';
import Typography from "@/components/typography";
import { Button } from '@/components/ui/button';

export const UserComponent: React.FC = () => {
    const { data: session, status } = useSession({ required: false });

    const signInProvider = process.env.NODE_ENV === 'development' ? 'QChatDevelopers' : 'azure-ad';

    if (status === "loading") {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {session ? (
                <Button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center text-white" aria-label="Log out" variant="link">
                    <LogOut className="w-4 h-4 mr-2 text-darkAltButton" aria-hidden="true"/>
                    <Typography variant="span">Log out</Typography>
                </Button>
            ) : (
                <Button onClick={() => signIn(signInProvider, { callbackUrl: '/' })} className="flex items-center text-white" aria-label="Log in" variant="link">
                    <LogIn className="w-4 h-4 mr-2 text-darkAltButton" aria-hidden="true"/>
                    <Typography variant="span">Log in</Typography>
                </Button>
            )}
        </div>
    );
};
