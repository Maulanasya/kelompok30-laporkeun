export default function GradientText({
  children,
  className = "",
  colors = ["#3191A0", "#E9C46A", "#3191A0"],
  animationSpeed = 8,
  as: Tag = "span",
}) {
  return (
    <>
      <style>{`
        @keyframes gtMove{0%{background-position:0% 50%}100%{background-position:100% 50%}}
        @media (prefers-reduced-motion:reduce){.gt-text{animation:none!important}}
      `}</style>
      <Tag
        className={`gt-text inline-block bg-clip-text text-transparent ${className}`}
        style={{
          backgroundImage: `linear-gradient(90deg, ${colors.join(", ")})`,
          backgroundSize: "200% 100%",
          animation: `gtMove ${animationSpeed}s linear infinite`,
        }}
      >
        {children}
      </Tag>
    </>
  );
}