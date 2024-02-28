import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import PromptForm from "@/components/ui/form";
// import { Dialog } from "@radix-ui/react-dialog";

export const dynamic = "force-dynamic";

export default async function Home() {
  return (
<div className="col-span-5 w-full h-full">
    <div className="h-full w-full justify-center grid grid-cols-2 grid-rows-2">
      <Card className="w-full p-4 col-span-1">
        <div className="h-full flex flex-col justify-between bg-altBackground text-foreground shadow-sm rounded-lg">
          <CardHeader>
            <CardTitle className="text-center font-bold my-2">Coming Soon</CardTitle>
          </CardHeader>
          <CardDescription className="px-4">
            This is a description for the first menu option.
          </CardDescription>
        </div>
      </Card>
      <Card className="w-full p-4 col-span-1">
        <div className="h-full flex flex-col justify-between bg-altBackground text-foreground shadow-sm rounded-lg">
          <CardHeader>
            <CardTitle className="text-center font-bold my-2">Coming Soon</CardTitle>
          </CardHeader>
          <CardDescription className="px-4">
            This is a description for the second menu option.
          </CardDescription>
        </div>
      </Card>
      <Card className="w-full p-4 col-span-1">
        <div className="h-full flex flex-col justify-between bg-altBackground text-foreground shadow-sm rounded-lg">
          <CardHeader>
            <CardTitle className="text-center font-bold my-2">Coming Soon</CardTitle>
          </CardHeader>
          <CardDescription className="px-4">
            This is a description for the third menu option.
          </CardDescription>
        </div>
      </Card>
      <Card className="w-full p-4 col-span-1">
        <div className="h-full flex flex-col justify-between bg-altBackground text-foreground shadow-sm rounded-lg">
          <CardHeader>
            <CardTitle className="text-center font-bold my-2">Coming Soon</CardTitle>
          </CardHeader>
          <CardDescription className="px-4">
            This is a description for the fourth menu option.
          </CardDescription>
        </div>
      </Card>
    </div>
</div>
  );
};
