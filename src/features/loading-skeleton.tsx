export const LoadingSkeleton = () => {
  return (
    <div className="h-full flex items-center justify-center bg-card flex-1">
      <img
        width={80}
        height={80}
        alt=""
        src="/ai-icon.png"
        className="animate-bounce"
      />
    </div>
  );
};
