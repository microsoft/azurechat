import { redirectIfAuthenticated } from "@/features/auth-page/helpers";
import { LogIn } from "@/features/auth-page/login";

export default async function Home() {
  await redirectIfAuthenticated();
  return (
    <main className="container max-w-lg flex items-center">
      <LogIn
        isDevMode={process.env.NODE_ENV === "development"}
        githubEnabled={!!process.env.AUTH_GITHUB_ID}
        entraIdEnabled={!!process.env.AZURE_AD_CLIENT_ID}
      />
    </main>
  );
}
