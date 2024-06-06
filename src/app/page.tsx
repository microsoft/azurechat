import { redirectIfAuthenticated } from "@/features/auth-page/helpers";
import { LogIn } from "@/features/auth-page/login";

export default async function Home() {
  await redirectIfAuthenticated();
  return (
    <main className="container max-w-full flex items-center m-10 justify-between">
      <img
        src={"login_ilustration1.svg"}
        className="absolute -z-10 left-0 bottom-0 top-24"
        width="2500px"
      />
      <img
        src={"login_ilustration2.svg"}
        className="absolute left-0 bottom-0 -z-10"
      />
      <LogIn isDevMode={process.env.NODE_ENV === "development"} />
    </main>
  );
}
