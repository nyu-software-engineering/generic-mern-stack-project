// The app's standard button. Uses the btn-primary / btn-secondary styles from index.css.
const VARIANT_CLASSES = {
  primary: 'btn-primary hover:btn-primary-hover',
  secondary: 'btn-secondary hover:bg-subtle',
}

export default function Button({ variant = 'primary', type = 'button', className = '', children, ...rest }) {
  // type defaults to "button" so a button inside a form doesn't submit it by accident;
  // pass type="submit" when you do want that.
  // ...rest forwards anything else (onClick, disabled, aria-*) to the real <button>.
  return (
    <button
      type={type}
      className={`min-h-11 ${VARIANT_CLASSES[variant]} focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}