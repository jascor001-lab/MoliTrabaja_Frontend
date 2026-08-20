"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

import { getNavDirection, MOTION_REDUCE, pageEnterClass } from "@/lib/motion";

type Props = {
  children: ReactNode;
};

export function PageTransition({ children }: Props) {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const direction = getNavDirection(prevPath.current, pathname);

  useEffect(() => {
    prevPath.current = pathname;
  }, [pathname]);

  return (
    <div key={pathname} className={`${pageEnterClass(direction)} ${MOTION_REDUCE}`}>
      {children}
    </div>
  );
}
