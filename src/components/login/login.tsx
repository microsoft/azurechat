"use client";
import { signIn } from "next-auth/react";
import { useEffect } from "react";

export const LogIn = () => { useEffect(() => { signIn("azure-ad"); }, [])};
