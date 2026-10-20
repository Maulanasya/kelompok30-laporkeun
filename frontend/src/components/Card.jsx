export default function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-lg border border-neutral-dark/30 bg-white p-5 ${className}`}
    >
      {children}
    </div>
  );
}