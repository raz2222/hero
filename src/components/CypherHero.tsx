import { useEffect, useRef } from "react";
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
 * Layout strategy
 * ---------------
 * • >= 1024px  a 1440x816 stage is scaled by `--s`, so the desktop composition
 *              is exact at any width. `--s` is set in JS because CSS cannot
 *              divide a length by a length to produce a unitless number.
 * • <  1024px  the same card components reflow into a fluid single column;
 *              the robot becomes a masked background element.
 *
 * Images are content, never structural: each one keeps its aspect ratio and is
 * only ever cropped (object-cover), never stretched.
 */

const IMG = {
  robot: "/img/robot.png",
  android: "/img/android.png",
  cpu: "/img/cpu.png",
} as const;

const NAV = [
  { label: "Models", href: "#models" },
  { label: "About us", href: "#about" },
] as const;

const BARCODE = Array.from({ length: 44 }, (_, i) => ({
  x: i * 3.5,
  w: i % 3 === 0 ? 2.1 : i % 2 === 0 ? 1.4 : 0.8,
}));

/* ------------------------------------------------------------------ atoms */

function Burger({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <span className={`cy-burger ${className ?? ""}`} style={style} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

function SearchBar({ className, style }: { className?: string; style?: React.CSSProperties }) {
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

function ModelCard({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <article className={`cy-model ${className ?? ""}`} style={style}>
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

      <div className="shot">
        <img className="android" src={IMG.android} alt="Cypher security android, model S712X" />
      </div>

      <div className="row">
        <h3>Model S712X</h3>
        <button type="button" aria-label="View model S712X">
          <ArrowDownRight strokeWidth={1.6} />
        </button>
      </div>

      <div className="dots">
        <span className="on" />
        <span />
        <span />
      </div>

      <p className="blurb">Our latest generation security androids, used to protect and serve.</p>

      <div className="code">
        <svg viewBox="0 0 155 30" role="img" aria-label="Product barcode">
          <g fill="hsl(var(--ink))">
            {BARCODE.map(({ x, w }) => (
              <rect key={x} x={x} width={w} height="30" />
            ))}
          </g>
        </svg>
        <b>
          Code
          <br />
          2145
        </b>
      </div>
    </article>
  );
}

function NewsCard({ className, style }: { className?: string; style?: React.CSSProperties }) {
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

function CpuCard({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <article className={`cy-cpu ${className ?? ""}`} style={style}>
      <div className="glass">
        <div className="txt">
          <h3>Highest CPU capacity in the market</h3>
          <span className="mini">Read More</span>
        </div>
        <img className="chip" src={IMG.cpu} alt="Circuit board with a Cypher processor" />
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
  const stage = useRef<HTMLDivElement>(null);

  // Keep the 1440-wide stage filling the viewport. Capped at 1.3334 so the
  // composition never outgrows an ultrawide screen.
  useEffect(() => {
    const el = stage.current;
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

  return (
    <section className="cy">
      {/* ───────────────────────────────────────── desktop: exact stage ── */}
      <div className="cy-stage-wrap" ref={stage}>
        <div className="cy-stage">
          <div className="bleed">
            <Backdrop />
          </div>

          <img className="robot" src={IMG.robot} alt="Cypher cyber-security android" />

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
          <h1 className="st-h1">Maximize protection and safety with Cypher lines cyber security androids</h1>
          <NewsCard className="st-news" />

          <CpuCard className="st-cpu" />
        </div>
      </div>

      {/* ─────────────────────────────────── mobile / tablet: fluid flow ── */}
      <div className="cy-flow">
        <Backdrop withCross={false} />
        <img className="robot" src={IMG.robot} alt="" aria-hidden="true" />

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

          <SearchBar style={{ fontSize: 10 }} />

          <div>
            <span className="eyebrow">The future is now</span>
            <i className="rule" />
            <h1>Maximize protection and safety with Cypher lines cyber security androids</h1>
          </div>

          <ModelCard className="st-model" />
          <NewsCard className="st-news" />
          <CpuCard className="st-cpu" />
        </div>
      </div>
    </section>
  );
}
