"use client";

import { useEffect, useRef, useState } from "react";
import { GenerateSpecResponse } from "@/lib/types";

interface SpecOutputProps {
  spec: GenerateSpecResponse;
}

// ── Nav ───────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "section-vision", label: "Visión" },
  { id: "section-users", label: "Usuarios" },
  { id: "section-features", label: "Funcionalidades" },
  { id: "section-flows", label: "Flujos" },
  { id: "section-architecture", label: "Arquitectura" },
  { id: "section-requirements", label: "Requisitos" },
];

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconVision() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1M4.22 4.22l.71.71m13.66 13.66.71.71M3 12H2m20 0h-1M4.22 19.78l.71-.71M18.36 5.64l.71-.71M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}

function IconFeatures() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function IconFlows() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  );
}

function IconArchitecture() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 0 0 3 3h7.5a3 3 0 0 0 3-3m-16.5 0a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0V8.25A2.25 2.25 0 0 1 6 6h12a2.25 2.25 0 0 1 2.25 2.25v6m-18 0v.75A2.25 2.25 0 0 0 4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25v-.75" />
    </svg>
  );
}

function IconRequirements() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 0 0 2.25 2.25h.75m0-3h3.75" />
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const NEGATION_RE =
  /\bno\s+(se\s+)?(requiere|incluye|contempla|necesita|considera)|fuera del alcance|exclu[iy]|sin soporte|no est[aá]/i;

function parseRequirements(text: string): { included: string[]; excluded: string[] } {
  const sentences = splitSentences(text);
  const included: string[] = [];
  const excluded: string[] = [];
  for (const s of sentences) {
    if (NEGATION_RE.test(s)) excluded.push(s);
    else included.push(s);
  }
  return { included, excluded };
}

function groupFeatures(features: string[]): { user: string[]; system: string[]; other: string[] } {
  return {
    user: features.filter((f) => /^El usuario puede/i.test(f)),
    system: features.filter((f) => /^El sistema permite/i.test(f)),
    other: features.filter((f) => !/^El usuario puede|^El sistema permite/i.test(f)),
  };
}

export function buildClipboardText(spec: GenerateSpecResponse): string {
  return [
    `VISIÓN\n${spec.vision}`,
    `USUARIOS\n${spec.users}`,
    `FUNCIONALIDADES\n${spec.features.map((f) => `• ${f}`).join("\n")}`,
    `FLUJOS PRINCIPALES\n${spec.flows.map((f, i) => `${i + 1}. ${f}`).join("\n")}`,
    `ARQUITECTURA\n${spec.architecture}`,
    `REQUISITOS\n${spec.requirements}`,
  ].join("\n\n");
}

// ── Animated wrapper ──────────────────────────────────────────────────────────

function Animated({ delay, visible, children }: { delay: number; visible: boolean; children: React.ReactNode }) {
  return (
    <div
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-500 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      {children}
    </div>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────

function Section({
  id,
  icon,
  title,
  color,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden scroll-mt-14"
    >
      <div className={`flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 ${color}`}>
        {icon}
        <h2 className="text-sm font-semibold tracking-wide">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

// ── User card colors ──────────────────────────────────────────────────────────

const USER_CARD_STYLES = [
  { border: "border-blue-100", bg: "bg-blue-50", icon: "text-blue-500" },
  { border: "border-violet-100", bg: "bg-violet-50", icon: "text-violet-500" },
  { border: "border-emerald-100", bg: "bg-emerald-50", icon: "text-emerald-500" },
  { border: "border-amber-100", bg: "bg-amber-50", icon: "text-amber-500" },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function SpecOutput({ spec }: SpecOutputProps) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState("section-vision");
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    function handleScroll() {
      const offset = 70;
      for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
        const el = document.getElementById(NAV_ITEMS[i].id);
        if (el && el.getBoundingClientRect().top <= offset + 20) {
          setActiveSection(NAV_ITEMS[i].id);
          return;
        }
      }
      setActiveSection(NAV_ITEMS[0].id);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildClipboardText(spec));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const userSentences = splitSentences(spec.users);
  const { user: userFeatures, system: systemFeatures, other: otherFeatures } = groupFeatures(spec.features);
  const { included, excluded } = parseRequirements(spec.requirements);

  return (
    <div className="space-y-4">
      {/* Sticky nav */}
      <nav
        ref={navRef}
        className="sticky top-0 z-20 -mx-4 px-4 py-2.5 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm"
      >
        <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {NAV_ITEMS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeSection === id
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Vision */}
      <Animated delay={0} visible={visible}>
        <div
          id="section-vision"
          className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 px-8 py-7 text-white shadow-md scroll-mt-14"
        >
          <div className="flex items-center gap-2.5 mb-3 opacity-80">
            <IconVision />
            <span className="text-xs font-semibold uppercase tracking-widest">Visión</span>
          </div>
          <p className="text-base leading-relaxed font-medium">{spec.vision}</p>
        </div>
      </Animated>

      {/* Users */}
      <Animated delay={100} visible={visible}>
        <Section id="section-users" icon={<IconUsers />} title="Usuarios objetivo" color="text-blue-700 bg-blue-50">
          <div className="space-y-3">
            {userSentences.map((sentence, i) => {
              const style = USER_CARD_STYLES[i % USER_CARD_STYLES.length];
              return (
                <div
                  key={i}
                  className={`flex gap-3 items-start rounded-xl border ${style.border} ${style.bg} px-4 py-3`}
                >
                  <svg
                    className={`mt-0.5 h-4 w-4 shrink-0 ${style.icon}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  <p className="text-sm text-gray-700 leading-relaxed">{sentence}</p>
                </div>
              );
            })}
          </div>
        </Section>
      </Animated>

      {/* Features */}
      <Animated delay={200} visible={visible}>
        <Section id="section-features" icon={<IconFeatures />} title="Funcionalidades" color="text-indigo-700 bg-indigo-50">
          <div className="space-y-4">
            {userFeatures.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-2">
                  Acciones del usuario
                </p>
                <ul className="space-y-2">
                  {userFeatures.map((f, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-700 leading-relaxed">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {systemFeatures.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-violet-500 uppercase tracking-wider mb-2">
                  Capacidades del sistema
                </p>
                <ul className="space-y-2">
                  {systemFeatures.map((f, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-700 leading-relaxed">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {otherFeatures.length > 0 && (
              <ul className="space-y-2">
                {otherFeatures.map((f, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-700 leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                    {f}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Section>
      </Animated>

      {/* Flows */}
      <Animated delay={300} visible={visible}>
        <Section id="section-flows" icon={<IconFlows />} title="Flujos principales" color="text-cyan-700 bg-cyan-50">
          <ol className="space-y-0">
            {spec.flows.map((flow, i) => {
              const isFirst = i === 0;
              const isLast = i === spec.flows.length - 1;
              return (
                <li key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-700">
                      {i + 1}
                    </span>
                    {!isLast && (
                      <span className="mt-1 mb-1 w-px flex-1 bg-cyan-100" style={{ minHeight: "1rem" }} />
                    )}
                  </div>
                  <div className="pb-4 flex-1">
                    {(isFirst || isLast) && (
                      <span
                        className={`mb-1 inline-block text-xs font-semibold uppercase tracking-wider ${
                          isFirst ? "text-cyan-600" : "text-emerald-600"
                        }`}
                      >
                        {isFirst ? "Inicio" : "Resultado"}
                      </span>
                    )}
                    <p className="text-sm text-gray-700 leading-relaxed">{flow}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Section>
      </Animated>

      {/* Architecture */}
      <Animated delay={400} visible={visible}>
        <Section id="section-architecture" icon={<IconArchitecture />} title="Arquitectura técnica" color="text-amber-700 bg-amber-50">
          <p className="text-sm text-gray-700 leading-relaxed">{spec.architecture}</p>
        </Section>
      </Animated>

      {/* Requirements */}
      <Animated delay={500} visible={visible}>
        <Section id="section-requirements" icon={<IconRequirements />} title="Requisitos" color="text-emerald-700 bg-emerald-50">
          <div className="space-y-4">
            {included.length > 0 && (
              <div>
                {excluded.length > 0 && (
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
                    Incluidos
                  </p>
                )}
                <ul className="space-y-2">
                  {included.map((r, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-700 leading-relaxed">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {excluded.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">
                  Fuera del alcance
                </p>
                <ul className="space-y-2">
                  {excluded.map((r, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-700 leading-relaxed">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>
      </Animated>

      {/* Bottom copy button */}
      <Animated delay={600} visible={visible}>
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3.5 text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md"
        >
          {copied ? (
            <>
              <svg className="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              ¡Copiado!
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
              </svg>
              Copiar especificación completa
            </>
          )}
        </button>
      </Animated>
    </div>
  );
}
