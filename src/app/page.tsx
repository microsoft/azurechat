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

  const createSession = async (hashval: string) => {
    if (email && name && betoken === hashval) {
      const result = await signIn('credentials', {
        redirect: true,
        username: name,
        email: email,
        callbackUrl: '/chat',
      });
    }
  };

  useEffect(() => {
    if (email) {
      const token = hashValue(email.split('').reverse().join(''));
      const hashval = hashValue(token);
      createSession(hashval);
    }
  }, []);

  return (
    <main className="container max-w-lg flex items-center">
      {(!email || !name) && <LogIn isDevMode={process.env.NODE_ENV === "development"} />}
    </main>
  );
}
