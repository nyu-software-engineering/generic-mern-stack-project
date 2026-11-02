function PageIntro({ eyebrow, title, description }) {
  return (
    <>
      <p className="mb-3 text-xs leading-[normal] font-[650] tracking-[0.08em] text-muted uppercase">{eyebrow}</p>
      <h1 tabIndex={-1} className="text-[clamp(2.5rem,7vw,4rem)] leading-[1.1] font-semibold tracking-[-0.05em]">
        {title}
      </h1>
      <p className="mt-5 mb-8 max-w-[42ch] text-lg leading-[1.7] text-muted">{description}</p>
    </>
  )
}

export default PageIntro
