export function Button({ children, variant = "primary", ...props }) {
  const className = variant === "secondary" ? "secondary-button" : "primary-button";

  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
}
