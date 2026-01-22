import { useEffect } from "react";

export function useKioskMode() {
  useEffect(() => {
    let timer: any;

    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        window.location.reload();
      }, 120000);
    };

    ["click", "touchstart"].forEach((e) =>
      window.addEventListener(e, reset)
    );

    reset();
    return () => clearTimeout(timer);
  }, []);
}
