export default function Overlay({ children }: { children: React.ReactNode }): JSX.Element | null {
  return children ? (
    <div className="fixed z-[999] flex size-full justify-center">
      <div className="absolute z-0 size-full animate-overlayShow bg-altBackgroundShade" />
      <div className="z-10 animate-contentShow">{children}</div>
    </div>
  ) : null
}
