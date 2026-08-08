export default async function Home() {
  return (
    <div className=" p-10">
      <div className="flex-col">
        <h1 className="text-xl font-semibold text-primary">
          You are not authorized to view this page
        </h1>
        <p className="mt-5">This page can only be viewed by admin users.</p>
      </div>
    </div>
  );
}
