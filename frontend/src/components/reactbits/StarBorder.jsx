export default function StarBorder({
  as: Tag = "button",
  className = "",
  innerClassName = "",
  color = "#E9C46A",
  speed = "6s",
  children,
  ...rest
}) {
  const glow = {
    background: `radial-gradient(circle, ${color}, transparent 10%)`,
    animationDuration: speed,
  };
  return (
    <>
      <style>{`
        @keyframes sbBottom{0%{transform:translateX(0);opacity:1}100%{transform:translateX(-100%);opacity:0}}
        @keyframes sbTop{0%{transform:translateX(0);opacity:1}100%{transform:translateX(100%);opacity:0}}
        .sb-star{animation-timing-function:linear;animation-iteration-count:infinite;animation-direction:alternate}
        @media (prefers-reduced-motion:reduce){.sb-star{animation:none!important}}
      `}</style>
      <Tag className={`relative inline-block overflow-hidden rounded-full py-px ${className}`} {...rest}>
        <span aria-hidden className="sb-star absolute z-0 w-[300%] h-1/2 opacity-70 rounded-full bottom-2.75 right-[-250%]" style={{ ...glow, animationName: "sbBottom" }} />
        <span aria-hidden className="sb-star absolute z-0 w-[300%] h-1/2 opacity-70 rounded-full top-2.5 left-[-250%]" style={{ ...glow, animationName: "sbTop" }} />
        <span className={`relative z-10 flex items-center justify-center gap-2 rounded-full ${innerClassName}`}>{children}</span>
      </Tag>
    </>
  );
}