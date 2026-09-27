// Reveal-on-scroll. Elements start hidden via `.js [data-reveal]` in global.css.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const targets: HTMLElement[] = [
  ...document.querySelectorAll<HTMLElement>('[data-reveal]'),
  ...[...document.querySelectorAll<HTMLElement>('[data-stagger]')].flatMap((g) =>
    [...g.children].map((c, i) => {
      (c as HTMLElement).style.transitionDelay = `${i * 110}ms`;
      return c as HTMLElement;
    }),
  ),
];
if (reduce || !('IntersectionObserver' in window)) {
  targets.forEach((el) => el.classList.add('in'));
} else {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      }),
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  );
  targets.forEach((el) => io.observe(el));
}

// Hero entrance
if (!reduce) {
  const ease = 'cubic-bezier(.2,.7,.2,1)';
  document.querySelectorAll<HTMLElement>('[data-anim]').forEach((el, i) =>
    el.animate([{ opacity: 0, transform: 'translateY(24px)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 1000, delay: 80 + i * 110, easing: ease, fill: 'backwards' }),
  );
  document.querySelectorAll<HTMLElement>('[data-anim-visual]').forEach((el) =>
    el.animate([{ opacity: 0, transform: 'translateY(40px) scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 1300, delay: 300, easing: ease, fill: 'backwards' }),
  );
}
