import { useEffect, useRef, useState } from 'react';

/**
 * Returns [ref, inView]. Once the element enters the viewport it stays true.
 * @param {number} threshold  0–1, fraction of element visible to trigger
 * @param {string} rootMargin css margin around viewport, e.g. "0px 0px -60px 0px"
 */
export function useInView(threshold = 0.12, rootMargin = '0px 0px -40px 0px') {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.unobserve(el); } },
      { threshold, rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin]);

  return [ref, inView];
}

/**
 * Inline style object for a fade-in-up animation.
 * Use like: <div ref={ref} style={fadeUp(inView, delay)} ...>
 */
export function fadeUp(inView, delay = 0) {
  return {
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity 0.55s ease ${delay}ms, transform 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
  };
}

/**
 * Fade in only (no movement).
 */
export function fadeIn(inView, delay = 0) {
  return {
    opacity: inView ? 1 : 0,
    transition: `opacity 0.5s ease ${delay}ms`,
  };
}

/**
 * Scale in from slightly smaller.
 */
export function scaleIn(inView, delay = 0) {
  return {
    opacity: inView ? 1 : 0,
    transform: inView ? 'scale(1)' : 'scale(0.94)',
    transition: `opacity 0.5s ease ${delay}ms, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
  };
}
