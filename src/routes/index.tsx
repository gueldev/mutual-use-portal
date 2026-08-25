import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  ArrowRight,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Menu,
  Search,
  TerminalSquare,
  TrendingUp,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Portal Uso Mútuo | Neoenergia Pernambuco" },
      {
        name: "description",
        content:
          "Portal da equipe de Uso Mútuo da Neoenergia Pernambuco: solicitações, minutas, notas e análise técnica de projetos em um só lugar.",
      },
      { property: "og:title", content: "Portal Uso Mútuo | Neoenergia Pernambuco" },
      {
        property: "og:description",
        content:
          "Consulta e acompanhamento de solicitações, minutas, notas e análise técnica de projetos da equipe de Uso Mútuo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const menu = [
  { label: "Solicitações", icon: Search, active: true },
  { label: "Minutas", icon: FileText },
  { label: "Incrementos", icon: TrendingUp },
];

const modules = [
  {
    title: "Minutas",
    icon: FileText,
    desc: "Elaboração e controle das minutas de contrato de uso mútuo.",
  },
  {
    title: "Notas",
    icon: FileSpreadsheet,
    desc: "Formulário de notas e histórico das avaliações lançadas.",
  },
  {
    title: "Análise Técnica",
    icon: Activity,
    desc: "Parecer técnico dos projetos de compartilhamento de postes.",
  },
  {
    title: "Log do Sistema",
    icon: TerminalSquare,
    desc: "Rastreabilidade de importações, edições e acessos.",
  },
];

function Index() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background font-sans lg:flex">
      {/* Sidebar */}
      <aside
        className={`bg-gradient-brand text-primary-foreground lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:shrink-0 ${
          open ? "block" : "hidden lg:block"
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-6">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/90">
            <Zap className="size-5" strokeWidth={2.5} />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Portal Uso Mútuo</p>
            <p className="text-xs opacity-80">Neoenergia Pernambuco</p>
          </div>
        </div>

        <nav className="px-4 pb-8">
          <p className="px-2 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] opacity-70">
            Menu
          </p>
          <ul className="space-y-1">
            {menu.map((item) => (
              <li key={item.label}>
                <button
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-brand-dark/60"
                  }`}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          <p className="px-2 pb-2 pt-6 text-[0.65rem] font-semibold uppercase tracking-[0.2em] opacity-70">
            Análise de Projetos
          </p>
          <ul className="space-y-1 text-sm">
            {["Minutas", "Formulário de Notas", "Notas", "Análise Técnica"].map((s) => (
              <li key={s}>
                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left opacity-90 transition-colors hover:bg-brand-dark/60">
                  <span className="size-1.5 rounded-full bg-primary-foreground/80" />
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Conteúdo */}
      <div className="flex-1">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Abrir menu"
              className="flex size-9 items-center justify-center rounded-lg border border-border text-primary lg:hidden"
            >
              <Menu className="size-4" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Portal</span>
              <ChevronDown className="size-3 -rotate-90 text-muted-foreground" />
              <span className="font-semibold text-brand-dark">Solicitações</span>
            </div>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            <FileSpreadsheet className="size-4" />
            Importar Excel
          </button>
        </header>

        <main>
          {/* Hero */}
          <section className="bg-gradient-deep px-5 py-14 text-primary-foreground lg:px-12 lg:py-20">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] opacity-80">
              Neoenergia Pernambuco
            </p>
            <h1 className="mt-4 max-w-2xl text-balance-tight text-3xl font-semibold leading-tight lg:text-5xl">
              Portal de Uso Mútuo e Análise de Projetos
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed opacity-85 lg:text-base">
              Centralize a consulta e o acompanhamento de solicitações de
              compartilhamento de infraestrutura, minutas, notas e pareceres
              técnicos da equipe.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                Acessar solicitações
                <ArrowRight className="size-4" />
              </button>
              <button className="rounded-lg border border-primary-foreground/40 px-5 py-3 text-sm font-semibold transition-colors hover:bg-primary-foreground/10">
                Ver minutas
              </button>
            </div>
          </section>

          {/* Indicadores */}
          <section className="grid gap-4 px-5 py-10 sm:grid-cols-3 lg:px-12">
            {[
              { n: "1.284", l: "Solicitações registradas" },
              { n: "96", l: "Minutas em análise" },
              { n: "12 dias", l: "Prazo médio de parecer" },
            ].map((i) => (
              <div
                key={i.l}
                className="rounded-xl border border-border bg-card p-5 shadow-panel"
              >
                <p className="text-2xl font-semibold text-brand-dark">{i.n}</p>
                <p className="mt-1 text-xs text-muted-foreground">{i.l}</p>
              </div>
            ))}
          </section>

          {/* Módulos */}
          <section className="px-5 pb-14 lg:px-12">
            <h2 className="text-lg font-semibold text-foreground">Módulos do portal</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ferramentas de consulta e acompanhamento da equipe de Uso Mútuo.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {modules.map((m) => (
                <article
                  key={m.title}
                  className="group rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-panel"
                >
                  <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <m.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-semibold text-foreground">{m.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {m.desc}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-dark">
                    Abrir módulo
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </article>
              ))}
            </div>
          </section>

          {/* Em breve */}
          <section className="mx-5 mb-14 rounded-xl border border-dashed border-border bg-secondary/60 p-8 text-center lg:mx-12">
            <Search className="mx-auto size-6 text-primary" />
            <h2 className="mt-4 text-xl font-semibold text-highlight">Solicitações</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Módulo de consulta e acompanhamento de solicitações.
            </p>
            <span className="mt-4 inline-block rounded-md border border-highlight/50 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-widest text-highlight">
              Em breve
            </span>
          </section>
        </main>

        <footer className="border-t border-border px-5 py-6 text-xs text-muted-foreground lg:px-12">
          Portal de Análise de Projetos · Uso Mútuo · Neoenergia Pernambuco
        </footer>
      </div>
    </div>
  );
}
