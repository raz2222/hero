import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";

import { CypherMark } from "@/components/CypherMark";
import "@/components/CypherHero.css";

/**
 * Cypher — futuristic robot hero.
 *
 * Rebuilt 1:1 from the Figma source "Futuristic robot website (Community)",
 * frame `Desktop - 1` (1440x816). Every number in CypherHero.css is the value
 * read off that frame.
 *
 * Layout
 * ------
 * • >= 1024px  a 1440x816 stage scaled by `--s`, so the desktop composition is
 *              exact at any width. `--s` is set in JS because CSS cannot divide
 *              a length by a length to produce a unitless number.
 * • <  1024px  the same card components reflow into a fluid single column.
 *
 * Motion
 * ------
 * Entrance uses the independent `translate`/`scale` properties; pointer
 * parallax owns `transform`, so the two never overwrite each other. Everything
 * collapses under `prefers-reduced-motion`, which also stops the autoplay.
 */

const MODELS = [
  {
    name: "Model S712X",
    code: "2145",
    blurb: "Our latest generation security androids, used to protect and serve.",
    seed: 7,
  },
  {
    name: "Model R408V",
    code: "6390",
    blurb: "Perimeter reconnaissance unit with silent pursuit and 360° threat mapping.",
    seed: 23,
  },
  {
    name: "Model K220D",
    code: "8874",
    blurb: "Close-protection android tuned for crowd density and rapid extraction.",
    seed: 91,
  },
] as const;

const NAV = [
  { label: "Models", href: "#models" },
  { label: "About us", href: "#about" },
] as const;

const SLIDE_MS = 6000;
const SWAP_MS = 780;

/** Deterministic bar widths per unit, so every model carries its own code. */
function bars(seed: number) {
  const out: { x: number; w: number }[] = [];
  let s = seed >>> 0;
  for (let i = 0; i < 44; i += 1) {
    s = (s * 1103515245 + 12345) >>> 0;
    const r = s % 3;
    out.push({ x: i * 3.5, w: r === 0 ? 2.1 : r === 1 ? 1.4 : 0.8 });
  }
  return out;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/* ------------------------------------------------------------------ atoms */

type Slot = { className?: string; style?: React.CSSProperties };

function Burger({ className, style }: Slot) {
  return (
    <span className={`cy-burger ${className ?? ""}`} style={style} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

function SearchBar({ className, style }: Slot) {
  return (
    <form className={`cy-search ${className ?? ""}`} style={style} onSubmit={(e) => e.preventDefault()}>
      <input type="search" placeholder="Search" aria-label="Search" />
      <button type="submit" aria-label="Search">
        <ArrowUpRight strokeWidth={2} />
      </button>
    </form>
  );
}

/* ------------------------------------------------------------------ cards */

function ModelCard({ className, style }: Slot) {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [swapping, setSwapping] = useState(false);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const card = useRef<HTMLElement>(null);

  const model = MODELS[index];

  const show = useCallback((next: number) => {
    setIndex(((next % MODELS.length) + MODELS.length) % MODELS.length);
    setSwapping(true);
  }, []);

  // Clear the swap flag once the transition has played out.
  useEffect(() => {
    if (!swapping) return;
    const t = window.setTimeout(() => setSwapping(false), SWAP_MS);
    return () => window.clearTimeout(t);
  }, [swapping, index]);

  // Autoplay yields to the reader: hover, keyboard focus, a hidden tab or a
  // card scrolled out of view all pause it.
  useEffect(() => {
    if (reduced || paused || !visible) return;
    const t = window.setInterval(() => show(indexRef.current + 1), SLIDE_MS);
    return () => window.clearInterval(t);
  }, [reduced, paused, visible, show]);

  const indexRef = useRef(index);
  indexRef.current = index;

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const el = card.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <article
      ref={card}
      className={`cy-model ${swapping ? "is-swapping" : ""} ${className ?? ""}`}
      style={style}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className="cy-sr" aria-live="polite">
        {`${model.name} — ${model.blurb}`}
      </span>

      <svg className="plates" viewBox="0 0 285 595" aria-hidden="true">
        <path
          d="M45 1h65c28 0 33 51 68 51h61a44 44 0 0 1 44 44v453a44 44 0 0 1-44 44H45a44 44 0 0 1-44-44V45A44 44 0 0 1 45 1Z"
          fill="hsl(var(--plate))"
          stroke="hsl(var(--foreground))"
          strokeWidth="2"
        />
        <path
          d="M45 46.5h65c28 0 33 51 68 51h61a44.5 44.5 0 0 1 44.5 44.5v325H.5V91A44.5 44.5 0 0 1 45 46.5Z"
          fill="hsl(var(--primary))"
          stroke="hsl(var(--foreground))"
          strokeWidth="1"
        />
      </svg>

      <div className="shot" role="img" aria-label={model.name}>
        {MODELS.map((m, i) => (
          <i key={m.code} className={`android ${i === index ? "is-active" : ""}`} data-slide={i} />
        ))}
        <i className="scan" aria-hidden="true" />
      </div>

      <div className="row">
        <h3>
          {/* re-keying replays the CSS swap animation — no timers to keep in sync */}
          <span className="swap">
            <span key={model.code}>{model.name}</span>
          </span>
        </h3>
        <button type="button" onClick={() => show(index + 1)} aria-label="Next model">
          <ArrowDownRight strokeWidth={1.6} />
        </button>
      </div>

      <div className="dots" role="tablist" aria-label="Choose a model">
        {MODELS.map((m, i) => (
          <button
            key={m.code}
            type="button"
            role="tab"
            className={i === index ? "on" : undefined}
            aria-selected={i === index}
            aria-label={`Model ${i + 1} of ${MODELS.length}`}
            onClick={() => show(i)}
          />
        ))}
      </div>

      <p className="blurb">
        <span className="swap">
          <span key={model.code}>{model.blurb}</span>
        </span>
      </p>

      <div className="code">
        <svg viewBox="0 0 155 30" role="img" aria-label="Product barcode">
          <g fill="hsl(var(--ink))">
            {bars(model.seed).map(({ x, w }) => (
              <rect key={x} x={x} width={w} height="30" />
            ))}
          </g>
        </svg>
        <b>
          <span className="swap">
            <span key={model.code}>
              Code
              <br />
              {model.code}
            </span>
          </span>
        </b>
      </div>
    </article>
  );
}

function NewsCard({ className, style }: Slot) {
  return (
    <article className={`cy-news ${className ?? ""}`} style={style}>
      <div className="body">
        <CypherMark className="mark" />
        <span className="date">12.09.2029</span>
        <span className="tag">News Article</span>
        <p>How the security space is and will change as android security take over the industry</p>
      </div>
      <button className="cta" type="button">
        Read More
      </button>
    </article>
  );
}

function CpuCard({ className, style }: Slot) {
  return (
    <article className={`cy-cpu ${className ?? ""}`} style={style}>
      <div className="glass">
        <div className="txt">
          <h3>Highest CPU capacity in the market</h3>
          <span className="mini">Read More</span>
        </div>
        <i className="chip" role="img" aria-label="Circuit board with a Cypher processor" />
      </div>
      <button className="go" type="button" aria-label="Read more about CPU capacity">
        <ArrowRight strokeWidth={2} />
      </button>
    </article>
  );
}

function Backdrop({ withCross = true }: { withCross?: boolean }) {
  return (
    <div className="cy-backdrop" aria-hidden="true">
      <div className="grad" />
      <div className="sheen" />
      <svg
        viewBox="0 0 1440 816"
        preserveAspectRatio="none"
        stroke="hsl(var(--foreground))"
        strokeOpacity=".16"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      >
        <line x1="600" y1="-40" x2="20" y2="700" />
        <line x1="900" y1="-40" x2="320" y2="700" />
        {withCross && <line x1="1290" y1="-40" x2="710" y2="700" />}
        <line x1="-40" y1="120" x2="700" y2="860" />
        {withCross && <line x1="620" y1="-40" x2="1440" y2="700" />}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------- hero */

export default function CypherHero() {
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  // Keep the 1440-wide stage filling the viewport, capped so the composition
  // never outgrows an ultrawide screen.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth || window.innerWidth;
      el.style.setProperty("--s", String(Math.min(w / 1440, 1.3334)));
      el.style.setProperty("--vw", `${w}px`);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Pointer parallax, pointer devices only.
  useEffect(() => {
    const box = wrap.current;
    const el = stage.current;
    if (!box || !el || reduced || !window.matchMedia("(hover: hover)").matches) return;

    let frame = 0;
    const move = (e: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = box.getBoundingClientRect();
        el.style.setProperty("--px", String(((e.clientX - r.left) / r.width - 0.5) * 2));
        el.style.setProperty("--py", String(((e.clientY - r.top) / r.height - 0.5) * 2));
      });
    };
    const reset = () => {
      el.style.setProperty("--px", "0");
      el.style.setProperty("--py", "0");
    };

    box.addEventListener("pointermove", move, { passive: true });
    box.addEventListener("pointerleave", reset);
    return () => {
      cancelAnimationFrame(frame);
      box.removeEventListener("pointermove", move);
      box.removeEventListener("pointerleave", reset);
    };
  }, [reduced]);

  return (
    <section className="cy">
      {/* ───────────────────────────────────────── desktop: exact stage ── */}
      <div className="cy-stage-wrap" ref={wrap}>
        <div className="cy-stage" ref={stage}>
          <div className="bleed">
            <Backdrop />
          </div>

          <div className="robot-layer">
            <i className="robot" role="img" aria-label="Cypher cyber-security android" />
          </div>

          <span className="cy-mark" style={{ left: 966, top: 171, width: 25, height: 25 }}>
            <i />
          </span>
          <span className="cy-mark" style={{ left: 1244, top: 225, width: 25, height: 25 }}>
            <i />
          </span>
          <span className="cy-mark" style={{ left: 1046, top: 679, width: 25, height: 25 }}>
            <i />
          </span>
          <svg className="leader" viewBox="0 0 1440 816" aria-hidden="true">
            <line x1="1244" y1="225" x2="1152" y2="392" stroke="hsl(var(--foreground))" strokeOpacity=".65" />
          </svg>

          <Burger className="hd-burger" />
          <CypherMark className="hd-mark" />
          <span className="hd-name">Cypher</span>
          <nav className="hd-nav">
            {NAV.map(({ label, href }) => (
              <a key={label} href={href}>
                {label}
              </a>
            ))}
          </nav>
          <SearchBar className="hd-search" />

          <ModelCard className="st-model" />

          <span className="st-eyebrow">The future is now</span>
          <i className="st-rule" />
          <h1 className="st-h1">
            {["Maximize protection", "and safety with", "Cypher lines cyber", "security androids"].map((line) => (
              <span className="ln" key={line}>
                <span>{line}</span>
              </span>
            ))}
          </h1>
          <NewsCard className="st-news" />

          <CpuCard className="st-cpu" />
        </div>
      </div>

      {/* ─────────────────────────────────── mobile / tablet: fluid flow ── */}
      <div className="cy-flow">
        <Backdrop withCross={false} />
        <div className="robot-layer" aria-hidden="true">
          <i className="robot" />
        </div>

        <div className="inner">
          <header>
            <Burger style={{ width: 27, height: 19, flex: "none" }} />
            <a className="brand" href="/">
              <CypherMark className="brand-mark" />
              <span>Cypher</span>
            </a>
            <nav>
              {NAV.map(({ label, href }) => (
                <a key={label} href={href}>
                  {label}
                </a>
              ))}
            </nav>
          </header>

          <SearchBar />

          <div className="head">
            <span className="eyebrow">The future is now</span>
            <i className="rule" />
            <h1>Maximize protection and safety with Cypher lines cyber security androids</h1>
          </div>

          <div className="stage-row">
            <ModelCard className="st-model" />
          </div>
          <CpuCard className="st-cpu" />
        </div>
      </div>
    </section>
  );
}
