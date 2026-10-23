export default function ShinyText({ text, speed = 5, className = "" }) {
  return (
    <>
      <style>{`@keyframes shinyText{0%{background-position:100% 0}100%{background-position:-100% 0}}`}</style>
      <span
        className={`inline-block bg-clip-text text-transparent ${className}`}
        style={{
          backgroundImage:
            "linear-gradient(120deg, #0F4C5C 40%, #1597A8 50%, #0F4C5C 60%)",
          backgroundSize: "200% 100%",
          animation: `shinyText ${speed}s linear infinite`,
        }}
      >
        {text}
      </span>
    </>
  );
}