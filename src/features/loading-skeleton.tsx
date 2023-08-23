import Image from "next/image";
export const LoadingSkeleton = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Image
        width={80}
        height={80}
        alt=""
        src="/ai-icon.png"
        quality={100}
        className="animate-bounce"
      />
    </div>
  );
};
