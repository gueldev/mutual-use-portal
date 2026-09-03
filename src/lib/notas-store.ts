import { useEffect, useState } from "react";

export type NotaRegistro = {
  id: string;
  criadoEm: string;
  nota: string;
  analisadoPor: string;
  pontosFaturados: string;
  equipamentosFaturados: string;
  pontosAgrupados: string;
  projeto5g: string;
  etapaAnalise: string;
  empresa: string;
  cnpj: string;
  enderecoEmpresa: string;
  municipio: string;
  responsavel: string;
  email: string;
  dataAnalise: string;
  statusNota: string;
  observacao: string;
  valorPonto: string;
  pontosRevelia: string;
  dataLancamento: string;
  motivosReprovacao: { documento: string; motivos: string[]; outro: string | null }[];
};

const KEY = "portal-uso-mutuo:notas";

let cache: NotaRegistro[] | null = null;
const listeners = new Set<() => void>();

function read(): NotaRegistro[] {
  if (cache) return cache;
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as NotaRegistro[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: NotaRegistro[]) {
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

export function addNota(nota: Omit<NotaRegistro, "id" | "criadoEm">): NotaRegistro {
  const registro: NotaRegistro = {
    ...nota,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    criadoEm: new Date().toISOString(),
  };
  write([registro, ...read()]);
  return registro;
}

export function updateNota(id: string, patch: Omit<NotaRegistro, "id" | "criadoEm">): void {
  write(read().map((n) => (n.id === id ? { ...patch, id: n.id, criadoEm: n.criadoEm } : n)));
}

export function getNota(id: string): NotaRegistro | undefined {
  return read().find((n) => n.id === id);
}

export function useNotas(): NotaRegistro[] {
  const [notas, setNotas] = useState<NotaRegistro[]>([]);

  useEffect(() => {
    const sync = () => setNotas([...read()]);
    sync();
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, []);

  return notas;
}
