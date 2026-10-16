import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";

export default function CountUp({ to, from = 0, duration = 2, separator = "", className = "" }) {
  const ref = useRef(null);
  const value = useMotionValue(from);
  const spring = useSpring(value, {
    damping: 20 + 40 * (1 / duration),
    stiffness: 100 * (1 / duration),
  });
  const inView = useInView(ref, { once: true });

  const format = (v) => {
    const s = String(Math.round(v));
    return separator ? s.replace(/\B(?=(\d{3})+(?!\d))/g, separator) : s;
  };

  useEffect(() => {
    if (ref.current) ref.current.textContent = format(from);
  }, [from]);

  useEffect(() => {
    if (inView) value.set(to);
  }, [inView, to, value]);

  useEffect(
    () =>
      spring.on("change", (v) => {
        if (ref.current) ref.current.textContent = format(v);
      }),
    [spring, separator]
  );

  return <span className={className} ref={ref} />;
}