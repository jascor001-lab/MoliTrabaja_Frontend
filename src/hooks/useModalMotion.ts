"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { MOTION_REDUCE } from "@/lib/motion";

const CLOSE_MS = 340;

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
    }, CLOSE_MS);
  }, [visible, onClosed]);

  const backdropClass = closing
    ? `animate-modal-backdrop-out ${MOTION_REDUCE}`
    : `animate-modal-backdrop-in ${MOTION_REDUCE}`;

  const panelClass = closing
    ? `animate-modal-panel-out sm:animate-modal-panel-out-md ${MOTION_REDUCE}`
    : `animate-modal-panel-in sm:animate-modal-panel-in-md ${MOTION_REDUCE}`;

  return {
    show: visible,
    closing,
    requestClose,
    backdropClass,
    panelClass,
  };
}
