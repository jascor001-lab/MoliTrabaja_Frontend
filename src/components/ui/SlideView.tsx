"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  MOTION_REDUCE,
  MOTION_DURATION_MS,
  motionEnterClass,
  motionExitClass,
  type SlideDirection,
} from "@/lib/motion";

export type { SlideDirection } from "@/lib/motion";

type Snapshot = {
  key: string | number;
  node: ReactNode;
};

type Props = {
  viewKey: string | number;
  direction?: SlideDirection;
  className?: string;
  children: ReactNode;
};

/**
 * Transición fluida: la vista anterior sale mientras la nueva entra (cross-slide).
 */
export function SlideView({
  viewKey,
  direction = "forward",
  className = "",
  children,
}: Props) {
  const [current, setCurrent] = useState<Snapshot>({
    key: viewKey,
    node: children,
  });
  const [leaving, setLeaving] = useState<{
    snapshot: Snapshot;
    direction: SlideDirection;
  } | null>(null);
  const transitionDirRef = useRef<SlideDirection>(direction);

  useEffect(() => {
    transitionDirRef.current = direction;
  }, [direction]);

  useEffect(() => {
    if (viewKey === current.key) {
      setCurrent((prev) => ({ ...prev, node: children }));
      return;
    }

    const dir = transitionDirRef.current;
    setLeaving({ snapshot: { ...current }, direction: dir });
    setCurrent({ key: viewKey, node: children });

    const timer = window.setTimeout(() => {
      setLeaving(null);
    }, MOTION_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [viewKey, children, current.key]);

  const enterDir = leaving?.direction ?? direction;

  return (
    <div
      className={`relative isolate min-h-0 motion-gpu ${className}`.trim()}
    >
      {leaving && (
        <div
          aria-hidden
          inert
          className={`absolute inset-0 z-0 overflow-hidden pointer-events-none motion-gpu ${motionExitClass(leaving.direction)} ${MOTION_REDUCE}`}
        >
          <div className="h-full w-full min-h-0">{leaving.snapshot.node}</div>
        </div>
      )}
      <div
        className={`relative z-10 h-full min-h-0 flex flex-col motion-gpu ${motionEnterClass(enterDir)} ${MOTION_REDUCE}`}
      >
        {current.node}
      </div>
    </div>
  );
}
