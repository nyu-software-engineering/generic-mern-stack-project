// an on/off switch, the knob has the same space on every side
export default function Toggle({ checked, onChange, label }){
    let colors = 'border-line bg-canvas'
    let knobPosition = 'translate-x-0'
    if (checked){
        colors = 'border-accent bg-accent'
        knobPosition = 'translate-x-5'
    }

    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() => onChange(!checked)}
            className={`inline-flex h-6 w-11 shrink-0 items-center border px-[3px] transition ${colors}`}
        >
            <span className={`h-4 w-4 bg-surface shadow transition-transform ${knobPosition}`} />
        </button>
    )
}