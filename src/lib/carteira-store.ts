import { useEffect, useState } from "react";
import { normalizarDadosCliente, type DadosCliente } from "./carteira-negociacao";

export type CarteiraRegistro = DadosCliente & { id: string; criadoEm: string };
const KEY = "portal-uso-mutuo:carteira";
const listeners = new Set<() => void>();

export function readCarteira(): CarteiraRegistro[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    let migrou = false;
    const registros = parsed.map((item) => {
      if (!Array.isArray(item.municipios)) migrou = true;
      return {
        ...normalizarDadosCliente(item),
        id: item.id,
        criadoEm: item.criadoEm,
      };
    });
    if (migrou) window.localStorage.setItem(KEY, JSON.stringify(registros));
    return registros;
  } catch {
    return [];
  }
}

export function salvarCarteira(dados: DadosCliente, id?: string | null): CarteiraRegistro {
  const registros = readCarteira();
  const existente = registros.find((registro) => registro.id === id);
  const normalizado = normalizarDadosCliente(dados);
  const registro = {
    ...normalizado,
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
