"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { DRAWER_DURATION_MS, MOTION_REDUCE } from "@/lib/motion";

export function useModalMotion(isOpen: boolean, onClosed: () => void) {
  const [visible, setVisible] = useState(isOpen);
  const [closing, setClosing] = useState(false);
  const busyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setClosing(false);
      busyRef.current = false;
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen]);

  const requestClose = useCallback(() => {
    if (busyRef.current || !visible) return;
    busyRef.current = true;
    setClosing(true);
    document.body.style.overflow = "";

    timerRef.current = setTimeout(() => {
      busyRef.current = false;
      setClosing(false);
      setVisible(false);
      onClosed();
    }, DRAWER_DURATION_MS);
  }, [visible, onClosed]);

  const backdropClass = closing
    ? `motion-modal-backdrop-out ${MOTION_REDUCE}`
    : `motion-modal-backdrop-in ${MOTION_REDUCE}`;

  const panelClass = closing
    ? `motion-modal-panel-out motion-gpu ${MOTION_REDUCE}`
    : `motion-modal-panel-in motion-gpu ${MOTION_REDUCE}`;

  return {
    show: visible,
    closing,
    requestClose,
    backdropClass,
    panelClass,
  };
}
