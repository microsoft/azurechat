import { LogIn } from "@/features/auth-page/login";

export default async function Home() {
  return (
    <main className="container max-w-lg flex items-center">
      <LogIn isDevMode={process.env.NODE_ENV === "development"} />
    </main>
  );
}
