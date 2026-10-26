export default function Input({ label, id, error, className = "", ...props }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-xs font-medium text-neutral-darker">
          {label}
        </label>
      )}
      <input
        id={id}
        name={id}
        className={`h-9 w-full rounded-md border bg-white px-3 text-xs text-neutral-darker outline-none placeholder:text-neutral-dark focus:border-tertiary ${
          error ? "border-danger" : "border-neutral-dark"
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-[10px] text-danger">{error}</p>}
    </div>
  );
}