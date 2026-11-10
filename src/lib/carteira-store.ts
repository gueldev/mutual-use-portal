import { useEffect, useState } from "react";
import type { DadosCliente } from "./carteira-negociacao";

export type CarteiraRegistro = DadosCliente & { id: string; criadoEm: string };
const KEY = "portal-uso-mutuo:carteira";
const listeners = new Set<() => void>();

export function readCarteira(): CarteiraRegistro[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function salvarCarteira(dados: DadosCliente, id?: string | null): CarteiraRegistro {
  const registros = readCarteira();
  const existente = registros.find((registro) => registro.id === id);
  const registro = {
    ...dados,
    id: existente?.id ?? crypto.randomUUID(),
    criadoEm: existente?.criadoEm ?? new Date().toISOString(),
  };
  const proximos = existente
    ? registros.map((item) => item.id === id ? registro : item)
    : [registro, ...registros];
  window.localStorage.setItem(KEY, JSON.stringify(proximos));
  listeners.forEach((listener) => listener());
  return registro;
}

export function useCarteira(): CarteiraRegistro[] {
  const [registros, setRegistros] = useState<CarteiraRegistro[]>([]);
  useEffect(() => {
    const sync = () => setRegistros(readCarteira());
    sync();
    listeners.add(sync);
    window.addEventListener("storage", sync);
    return () => {
      listeners.delete(sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return registros;
}