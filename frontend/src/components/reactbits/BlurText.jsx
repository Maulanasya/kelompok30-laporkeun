import { motion } from "motion/react";

export default function BlurText({
  text = "",
  delay = 200,
  className = "",
  animateBy = "words",
  direction = "top",
  onAnimationComplete,
}) {
  const parts = animateBy === "words" ? text.split(" ") : text.split("");
  const y = direction === "top" ? -30 : 30;

  return (
    <h1 className={`flex ${className}`}>
      {parts.map((part, i) => (
        <motion.span
          key={i}
          initial={{ filter: "blur(10px)", opacity: 0, y }}
          whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: (i * delay) / 1000, ease: [0.22, 1, 0.36, 1] }}
          onAnimationComplete={i === parts.length - 1 ? onAnimationComplete : undefined}
          className="inline-block will-change-[transform,filter,opacity]"
        >
          {part === " " ? "\u00A0" : part}
          {animateBy === "words" && i < parts.length - 1 && "\u00A0"}
        </motion.span>
      ))}
    </h1>
  );
}