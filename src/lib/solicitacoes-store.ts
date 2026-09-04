import { useEffect, useState } from "react";

export type SolicitacaoRegistro = {
  id: string;
  criadoEm: string;
  cnpj: string;
  razaoSocial: string;
  plaqueta: string;
  tn: string;
  notaProjeto: string;
  pontosNovos: string;
  pontosAgrupados: string;
  equipamentos: string;
  projeto5g: string;
  municipio: string;
  rota: string;
  responsavel: string;
  email: string;
  status: string;
  justificativa: string;
  documentos: string[];
};

const KEY = "portal-uso-mutuo:solicitacoes";

let cache: SolicitacaoRegistro[] | null = null;
const listeners = new Set<() => void>();

function read(): SolicitacaoRegistro[] {
  if (cache) return cache;
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as SolicitacaoRegistro[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: SolicitacaoRegistro[]) {
  cache = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* armazenamento indisponível */
    }
  }
  listeners.forEach((l) => l());
}

export function addSolicitacao(
  solicitacao: Omit<SolicitacaoRegistro, "id" | "criadoEm">,
): SolicitacaoRegistro {
  const registro: SolicitacaoRegistro = {
    ...solicitacao,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    criadoEm: new Date().toISOString(),
  };
  write([registro, ...read()]);
  return registro;
}

export function updateSolicitacao(
  id: string,
  patch: Omit<SolicitacaoRegistro, "id" | "criadoEm">,
): void {
  write(read().map((s) => (s.id === id ? { ...patch, id: s.id, criadoEm: s.criadoEm } : s)));
}

export function getSolicitacao(id: string): SolicitacaoRegistro | undefined {
  return read().find((s) => s.id === id);
}

export function useSolicitacoes(): SolicitacaoRegistro[] {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoRegistro[]>([]);

  useEffect(() => {
    const sync = () => setSolicitacoes([...read()]);
    sync();
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, []);

  return solicitacoes;
}
