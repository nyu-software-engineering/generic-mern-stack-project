export default function TextField({ label, type = "text", placeholder, value, onChange, autoComplete }) {
    const id = label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="field">
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
        />
      </div>
    );
  }