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
 * • <  1024px  one non-scrolling frame pinned to 100dvh.
 *
 * The deck
 * --------
 * Three real cards are stacked, each carrying its own colour, photo, name, copy,
 * code and barcode. Advancing rotates the deck — the top card is pulled off,
 * dips behind and slots in at the back — and the render behind the hero plus the
 * headline follow whichever card is now on top.
 */

const UNITS = [
  {
    name: "Model S712X",
    code: "2145",
    seed: 7,
    accent: "#7199fe",
    eyebrow: "The future is now",
    lines: ["Maximize protection", "and safety with", "Cypher lines cyber", "security androids"],
    blurb: "Our latest generation security androids, used to protect and serve.",
    feature: "Highest CPU capacity in the market",
    href: "#model-s712x",
    spec: [["Core", "S-9"], ["Range", "12 km"]],
  },
  {
    name: "Model R408V",
    code: "6390",
    seed: 23,
    accent: "#5fd9c8",
    eyebrow: "Built for the perimeter",
    lines: ["Map every threat", "before it breaches", "the fence line with", "Cypher recon units"],
    blurb: "Perimeter reconnaissance unit with silent pursuit and 360° threat mapping.",
    feature: "Longest unbroken patrol range",
    href: "#model-r408v",
    spec: [["Core", "R-4"], ["Range", "30 km"]],
  },
  {
    name: "Model K220D",
    code: "8874",
    seed: 91,
    accent: "#b79cff",
    eyebrow: "Made for the crowd",
    lines: ["Move your people", "through any crowd", "with Cypher close", "protection androids"],
    blurb: "Close-protection android tuned for crowd density and rapid extraction.",
    feature: "Fastest extraction in its class",
    href: "#model-k220d",
    spec: [["Core", "K-2"], ["Range", "6 km"]],
  },
] as const;

const NAV = [
  { label: "Models", href: "#models" },
  { label: "About us", href: "#about" },
] as const;

/** One full deal; must match the `cy-deal` duration in CypherHero.css. */
const DEAL_MS = 900;
const DWELL_MS = 6000;

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

function RobotLayers({ front, label }: { front: number; label?: string }) {
  return (
    <div
      className="robot-layer"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {UNITS.map((u, i) => (
        <i key={u.code} className={`robot ${i === front ? "is-active" : ""}`} data-slide={i} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------- deck */

/** Owns the deck order so the robot and the headline can follow the top card. */
function useDeck() {
  const reduced = usePrefersReducedMotion();
  const [front, setFront] = useState(0);
  /** Which card is mid-move, and which way: 1 dealt away, -1 drawn back. */
  const [anim, setAnim] = useState<{ card: number; dir: 1 | -1 } | null>(null);
  const [paused, setPaused] = useState(false);
  const queue = useRef(0);
  const frontRef = useRef(front);
  const animRef = useRef(anim);
  frontRef.current = front;
  animRef.current = anim;

  const next = useCallback(() => {
    if (animRef.current) return;
    setAnim({ card: frontRef.current, dir: 1 });
    setFront((f) => (f + 1) % UNITS.length);
  }, []);

  const prev = useCallback(() => {
    if (animRef.current) return;
    const target = (frontRef.current - 1 + UNITS.length) % UNITS.length;
    setAnim({ card: target, dir: -1 });
    setFront(target);
  }, []);

  const onMoveEnd = useCallback(() => {
    setAnim(null);
    if (queue.current > 0) {
      queue.current -= 1;
      window.setTimeout(next, 0);
    }
  }, [next]);

  const goTo = useCallback(
    (i: number) => {
      const steps = (i - frontRef.current + UNITS.length) % UNITS.length;
      if (!steps) return;
      queue.current += steps - 1;
      next();
    },
    [next],
  );

  useEffect(() => {
    if (reduced || paused || anim) return;
    const t = window.setInterval(next, DWELL_MS);
    return () => window.clearInterval(t);
  }, [reduced, paused, anim, next]);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return {
    front,
    anim,
    moving: anim !== null,
    next,
    prev,
    goTo,
    onMoveEnd,
    pause: useCallback(() => setPaused(true), []),
    resume: useCallback(() => setPaused(false), []),
  };
}

type DeckApi = ReturnType<typeof useDeck>;

/** Past this much travel, a drag becomes a deal rather than a nudge. */
const SWIPE_PX = 48;

function Deck({ className, style, deck }: Slot & { deck: DeckApi }) {
  const { front, anim, moving, next, prev, goTo, onMoveEnd, pause, resume } = deck;
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef({ startX: 0, dx: 0, active: false });

  useEffect(() => {
    const el = box.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? resume() : pause()), {
      threshold: 0.25,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [pause, resume]);

  // A backgrounded tab throttles timers hard, so the move is cleaned up on
  // animationend, with a timer only as a safety net.
  useEffect(() => {
    if (!moving) return;
    const t = window.setTimeout(onMoveEnd, DEAL_MS + 400);
    return () => window.clearTimeout(t);
  }, [moving, onMoveEnd]);

  // Drag the deck like a real one: the top card follows the finger and, past a
  // short threshold, is dealt away or drawn back on release.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const top = () => el.querySelector<HTMLElement>('[data-pos="0"]');

    const move = (e: PointerEvent) => {
      if (!drag.current.active) return;
      drag.current.dx = e.clientX - drag.current.startX;
      const { dx } = drag.current;
      if (Math.abs(dx) > 4) el.classList.add("is-dragging");
      const card = top();
      if (card) {
        card.style.transform = `translate(${dx * 0.45}px, ${Math.abs(dx) * 0.06}px) rotate(${dx * 0.03}deg)`;
      }
    };

    const end = () => {
      if (!drag.current.active) return;
      drag.current.active = false;
      el.classList.remove("is-dragging");
      const card = top();
      if (card) card.style.transform = "";
      const { dx } = drag.current;
      drag.current.dx = 0;
      if (dx < -SWIPE_PX) next();
      else if (dx > SWIPE_PX) prev();
      else resume();
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [next, prev, resume]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (moving || (e.pointerType === "mouse" && e.button !== 0)) return;
    drag.current = { startX: e.clientX, dx: 0, active: true };
    pause();
  };

  return (
    <div
      ref={box}
      className={`deck ${moving ? "is-dealing" : ""} ${className ?? ""}`}
      style={style}
      onPointerDown={onPointerDown}
      onPointerEnter={pause}
      onPointerLeave={resume}
      onFocus={pause}
      onBlur={resume}
    >
      <span className="cy-sr" aria-live="polite">
        {`${UNITS[front].name} — ${UNITS[front].eyebrow}`}
      </span>

      {UNITS.map((u, i) => (
        <article
          key={u.code}
          className={`cy-model ${anim?.card === i ? (anim.dir === 1 ? "is-dealt" : "is-drawn") : ""}`}
          data-pos={(i - front + UNITS.length) % UNITS.length}
          style={{ "--accent": u.accent } as React.CSSProperties}
          onAnimationEnd={anim?.card === i ? onMoveEnd : undefined}
        >
          <svg className="plates" viewBox="0 0 285 595" aria-hidden="true">
            <path
              d="M45 1h65c28 0 33 51 68 51h61a44 44 0 0 1 44 44v453a44 44 0 0 1-44 44H45a44 44 0 0 1-44-44V45A44 44 0 0 1 45 1Z"
              fill="hsl(var(--plate))"
              stroke="hsl(var(--foreground))"
              strokeWidth="2"
            />
            <path
              d="M45 46.5h65c28 0 33 51 68 51h61a44.5 44.5 0 0 1 44.5 44.5v325H.5V91A44.5 44.5 0 0 1 45 46.5Z"
              fill="var(--accent)"
              stroke="hsl(var(--foreground))"
              strokeWidth="1"
            />
          </svg>

          <div className="shot" role="img" aria-label={u.name}>
            <i className="android" data-slide={i} />
            <i className="scan" aria-hidden="true" />
          </div>

          <div className="row">
            <h3>{u.name}</h3>
            <button type="button" onClick={next} aria-label="Next model">
              <ArrowDownRight strokeWidth={1.6} />
            </button>
          </div>

          <div className="dots" role="tablist" aria-label="Choose a model">
            {UNITS.map((d, k) => (
              <button
                key={d.code}
                type="button"
                role="tab"
                className={k === i ? "on" : undefined}
                aria-selected={k === i}
                aria-label={`Model ${k + 1} of ${UNITS.length}`}
                onClick={() => goTo(k)}
              />
            ))}
          </div>

          <p className="blurb">{u.blurb}</p>

          <div className="code">
            <svg className="barcode" viewBox="0 0 155 30" role="img" aria-label="Product barcode">
              <g fill="hsl(var(--ink))">
                {bars(u.seed).map(({ x, w }) => (
                  <rect key={x} x={x} width={w} height="30" />
                ))}
              </g>
            </svg>
            <dl className="spec">
              <div>
                <dt>Code</dt>
                <dd>{u.code}</dd>
              </div>
              {u.spec.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </article>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ cards */

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

function CpuCard({ className, style, front }: Slot & { front: number }) {
  const unit = UNITS[front];
  return (
    <a
      className={`cy-cpu ${className ?? ""}`}
      style={style}
      href={unit.href}
      aria-label={`View ${unit.name} — ${unit.feature}`}
    >
      <div className="glass">
        <div className="txt">
          <h3>{unit.feature}</h3>
          <span className="mini">View {unit.name}</span>
        </div>
        <i className="chip" role="img" aria-label="Circuit board with a Cypher processor" />
      </div>
      <span className="go" aria-hidden="true">
        <ArrowRight strokeWidth={2} />
      </span>
    </a>
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
  const desktop = useDeck();
  const mobile = useDeck();

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

  const unit = UNITS[desktop.front];
  const mobileUnit = UNITS[mobile.front];

  return (
    <section className="cy">
      {/* ───────────────────────────────────────── desktop: exact stage ── */}
      <div className="cy-stage-wrap" ref={wrap}>
        <div className="cy-stage" ref={stage}>
          <div className="bleed">
            <Backdrop />
          </div>

          <RobotLayers front={desktop.front} label="Cypher cyber-security android" />

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

          <Deck className="st-model" deck={desktop} />

          {/* re-keying replays the CSS reveal, so the copy follows the top card */}
          <span key={`eyebrow-${desktop.front}`} className="st-eyebrow is-swap">
            {unit.eyebrow}
          </span>
          <i className="st-rule" />
          <h1 key={`headline-${desktop.front}`} className="st-h1 is-swap">
            {unit.lines.map((line) => (
              <span className="ln" key={line}>
                <span>{line}</span>
              </span>
            ))}
          </h1>
          <NewsCard className="st-news" />

          <CpuCard className="st-cpu" front={desktop.front} />
        </div>
      </div>

      {/* ─────────────────────────────────── mobile / tablet: one frame ── */}
      <div className="cy-flow">
        <Backdrop withCross={false} />
        <RobotLayers front={mobile.front} />

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
            <span className="eyebrow">{mobileUnit.eyebrow}</span>
            <i className="rule" />
            <h1>{mobileUnit.lines.join(" ")}</h1>
          </div>

          <div className="stage-row">
            <Deck className="st-model" deck={mobile} />
          </div>
          <CpuCard className="st-cpu" front={mobile.front} />
        </div>
      </div>
    </section>
  );
}
