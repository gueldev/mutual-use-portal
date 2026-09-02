import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  LayoutPanelTop,
  Menu,
  Search,
  TrendingUp,
  X,
} from "lucide-react";

import TriagemSolicitacao from "@/components/TriagemSolicitacao";
import FormularioNotas from "@/components/FormularioNotas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Portal Uso Mútuo | Neoenergia Pernambuco" },
      {
        name: "description",
        content:
          "Portal da equipe de Uso Mútuo da Neoenergia Pernambuco: solicitações, minutas, notas e análise técnica de projetos.",
      },
      { property: "og:title", content: "Portal Uso Mútuo | Neoenergia Pernambuco" },
      {
        property: "og:description",
        content:
          "Módulo de consulta e acompanhamento de solicitações de uso mútuo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type ViewKey =
  | "solicitacoes"
  | "minutas-sub"
  | "formulario-notas"
  | "notas"
  | "analise-tecnica"
  | "minutas"
  | "incrementos"
  | "log";

const views: Record<ViewKey, { label: string; description: string }> = {
  solicitacoes: {
    label: "Solicitações",
    description: "Triagem e acompanhamento de solicitações de uso mútuo.",
  },
  "minutas-sub": {
    label: "Minutas",
    description: "Minutas vinculadas à análise de projetos.",
  },
  "formulario-notas": {
    label: "Formulário de Notas",
    description: "Registro de notas técnicas dos projetos.",
  },
  notas: { label: "Notas", description: "Consulta das notas emitidas." },
  "analise-tecnica": {
    label: "Análise Técnica de Projetos",
    description: "Etapa 2 — avaliação técnica dos projetos aprovados.",
  },
  minutas: { label: "Minutas", description: "Gestão de minutas contratuais." },
  incrementos: {
    label: "Incrementos",
    description: "Controle de incrementos de pontos e equipamentos.",
  },
  log: {
    label: "Log do Sistema",
    description: "Histórico de ações realizadas no portal.",
  },
};

const subItems: { key: ViewKey; label: string }[] = [
  { key: "minutas-sub", label: "Minutas" },
  { key: "formulario-notas", label: "Formulário de Notas" },
  { key: "notas", label: "Notas" },
  { key: "analise-tecnica", label: "Análise Técnica de Projetos" },
];

function Index() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [view, setView] = useState<ViewKey>("solicitacoes");

  const select = (key: ViewKey) => {
    setView(key);
    setOpen(false);
  };

  const itemClass = (active: boolean) =>
    `mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-primary shadow-panel"
        : "opacity-95 hover:bg-brand-dark/50 hover:translate-x-0.5"
    }`;

  const current = views[view];
  const inAnalise = subItems.some((s) => s.key === view);

  return (
    <div className="min-h-screen bg-background font-sans md:flex">
      {/* Barra lateral */}
      <aside
        className={`bg-gradient-brand text-primary-foreground md:sticky md:top-0 md:flex md:h-screen md:w-72 md:shrink-0 md:flex-col ${
          open ? "fixed inset-0 z-50 flex flex-col" : "hidden"
        }`}
      >
        {/* Logo Neoenergia */}
        <div className="flex items-center gap-3 px-5 py-5">
          <img
            src="/favicon.png"
            alt="Neoenergia"
            width={42}
            height={42}
            className="shrink-0 rounded-lg bg-white object-contain p-1 shadow-panel"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight tracking-tight">
              NEOENERGIA
            </span>
            <span className="text-[0.7rem] font-medium leading-tight opacity-90">
              Pernambuco
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
            className="ml-auto flex size-8 items-center justify-center rounded-lg bg-brand-dark/40 md:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-6">
          <p className="px-3 pb-2 text-[0.62rem] font-semibold uppercase tracking-[0.22em] opacity-70">
            Menu
          </p>

          <button
            onClick={() => select("solicitacoes")}
            className={itemClass(view === "solicitacoes")}
          >
            <Search className="size-4" />
            Solicitações
          </button>

          <button
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className={itemClass(inAnalise && !expanded)}
          >
            <Activity className="size-4" />
            <span className="flex-1 text-left">Análise de Projetos</span>
            <ChevronDown
              className={`size-4 transition-transform duration-300 ${
                expanded ? "" : "-rotate-90"
              }`}
            />
          </button>

          <div
            className={`grid transition-all duration-300 ease-out ${
              expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <ul className="ml-5 space-y-0.5 overflow-hidden border-l border-primary-foreground/25 pl-3">
              {subItems.map((s) => (
                <li key={s.key}>
                  <button
                    onClick={() => select(s.key)}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[0.82rem] font-medium transition-all duration-200 ${
                      view === s.key
                        ? "bg-brand-dark/60 text-primary-foreground"
                        : "opacity-90 hover:bg-brand-dark/50 hover:translate-x-0.5"
                    }`}
                  >
                    <span
                      className={`shrink-0 rounded-full bg-primary-foreground transition-all ${
                        view === s.key ? "size-2" : "size-1.5 opacity-85"
                      }`}
                    />
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => select("minutas")}
            className={itemClass(view === "minutas")}
          >
            <FileText className="size-4" />
            Minutas
          </button>
          <button
            onClick={() => select("incrementos")}
            className={itemClass(view === "incrementos")}
          >
            <TrendingUp className="size-4" />
            Incrementos
          </button>

          <p className="px-3 pb-2 pt-6 text-[0.62rem] font-semibold uppercase tracking-[0.22em] opacity-70">
            Ferramentas
          </p>
          <button
            onClick={() => select("log")}
            className={itemClass(view === "log")}
          >
            <LayoutPanelTop className="size-4" />
            Log do Sistema
          </button>
        </nav>

        <p className="px-5 pb-5 text-[0.65rem] opacity-70">
          Portal de Análise
          <br />
          de Projetos · v1.0
        </p>
      </aside>

      {/* Área de conteúdo */}
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Abrir menu"
              className="flex size-9 items-center justify-center rounded-lg border border-border text-primary md:hidden"
            >
              <Menu className="size-4" />
            </button>
            <nav className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Portal</span>
              <span className="text-border">/</span>
              {inAnalise && (
                <>
                  <span className="text-muted-foreground">Análise de Projetos</span>
                  <span className="text-border">/</span>
                </>
              )}
              <span className="font-semibold text-highlight">{current.label}</span>
            </nav>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            <FileSpreadsheet className="size-4" />
            Importar Excel
          </button>
        </header>

        <main className="flex-1">
          {view === "solicitacoes" ? (
            <div key={view} className="animate-rise">
              <TriagemSolicitacao />
            </div>
          ) : (
            <div
              key={view}
              className="animate-rise flex flex-1 items-center justify-center px-6 py-20"
            >
              <div className="text-center">
                <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <Search className="size-7" strokeWidth={1.75} />
                </span>
                <h1 className="mt-6 text-2xl font-semibold text-highlight">
                  {current.label}
                </h1>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                  {current.description}
                </p>
                <span className="mt-5 inline-block rounded-md border border-highlight/50 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-highlight">
                  Em breve
                </span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
