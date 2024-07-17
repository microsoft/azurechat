"use client"
import { LogIn } from "@/features/auth-page/login";
import { useSearchParams, useRouter } from 'next/navigation';
import {hashValue} from "@/features/auth-page/helpers";
import { useEffect, useState } from "react";

export default function Home() {
  const [name, setName] = useState<any>("");
  const [email, setEmail] = useState<any>("");
  const [verifycode, setVerifycode] = useState<any>("");
  const route = useRouter();
  const searchParams = useSearchParams();
  const betoken = searchParams?.get('token')!;

  const verifyToken = async () => {
    const res = await fetch('/api/verify-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: betoken }),
    });

    const data = await res.json();
    if (data.valid) {
      const userdata = JSON.parse(data.message);
      setName(userdata.name);
      setEmail(userdata.email);
      setVerifycode(userdata.verifycode);
      if (userdata.verifycode) {
        confirmVerifyCode(userdata.verifycode);
      }
    }
  };

  const confirmVerifyCode = async (verifycode: string) => {
    // const res = await fetch('http://localhost:8000/jwt-verifycode/' + verifycode);
    const res = await fetch('https://staging.officio.work/jwt-verifycode/' + verifycode);

    const data = await res.json();
    if (data.valid) {
      console.log("Verified");
      createSession();
    }
  }

  const createSession = async () => {
    if (email && name) {
      const res = await fetch('/api/session/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
          id: hashValue(email),
          image: "",
          isAdmin: false,
        }),
      });
  
      const data = await res.json();
      
      route.push("/chat");
    }
  };

  useEffect(() => {
    verifyToken();
  }, [name, email, verifycode]);

  return (
    <main className="container max-w-lg flex items-center">
      {name && email && <LogIn isDevMode={process.env.NODE_ENV === "development"} />}
    </main>
  );
}
