"use client";

import { Card } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import React from 'react';

const Home: React.FC = () => {
  const router = useRouter();

  const handleRedirectHome = async () => {
    try {
      await router.push('/');
    } catch (error) {
      console.error('Redirect failed:', error);
    }
  };

  return (
    <Card className="h-full items-top flex justify-left flex-1 p-10">
      <div className="flex flex-col"> {/* Ensure flex direction is explicitly set */}
        <h1 className="text-xl font-semibold">You are not authorised to view this page</h1>
        <p className="mt-5">
          Please <button onClick={handleRedirectHome} className="text-link hover:text-altButton hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Return Home">click here</button> to return home.
        </p>
      </div>
    </Card>
  );
};

export default Home;
