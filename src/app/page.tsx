"use client"
import { LogIn } from "@/features/auth-page/login";
import { useSearchParams, useRouter } from 'next/navigation';
import {hashValue} from "@/features/auth-page/helpers";
import { useEffect } from "react";
import { signIn } from "next-auth/react";

export default function Home() {
  const route = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams?.get('username')!;
  const email = searchParams?.get('email')!;
  const betoken = searchParams?.get('token')!;

  useEffect(() => {
    const createSession = async () => {
      if (email && name && betoken === hashValue(hashValue(email.split('').reverse().join('')))) {
        await signIn('credentials', {
          redirect: true,
          username: name,
          email: email,
          callbackUrl: '/chat',
        });
      }
    };

    if (email) {
      createSession();
    }
  }, [email, name, betoken]);

  return (
    <main className="container max-w-lg flex items-center">
      {(!email || !name) && <LogIn isDevMode={process.env.NODE_ENV === "development"} />}
    </main>
  );
}
