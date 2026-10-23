export default function FormField({ label, htmlFor, children, hint }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-xs font-semibold text-primary"
        >
          {label}
        </label>
      )}
      {children}
      {hint && <p className="text-[10px] text-slate-500">{hint}</p>}
    </div>
  );
}