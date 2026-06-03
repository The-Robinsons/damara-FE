import React, { type ReactNode } from "react";

interface MobileLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function MobileLayout({ children, className }: MobileLayoutProps) {
  return (
    <div className="w-full min-h-screen flex justify-center">
      <div
        className={`damara-app-shell w-full max-w-[430px] min-h-dvh min-h-screen bg-transparent ${className ?? ""}`}
      >
        {children}
      </div>
    </div>
  );
}
