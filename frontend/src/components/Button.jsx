export default function Button({
  children,
  variant = "primary",
  type = "button",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none disabled:opacity-50";

  const variants = {
    primary:
      "bg-primary text-white hover:bg-primary-hover active:bg-primary-active",
    secondary:
      "bg-tertiary text-white hover:bg-tertiary-hover active:bg-tertiary-active",
    outline:
      "border border-tertiary text-tertiary bg-white hover:bg-tertiary-light",
    ghost: "text-tertiary hover:bg-tertiary-light",
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}