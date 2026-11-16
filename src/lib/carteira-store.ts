import { useEffect, useState } from "react";
import {
  normalizarDadosCliente,
  separarDadosPorMunicipio,
  type DadosCliente,
} from "./carteira-negociacao";

export type CarteiraRegistro = DadosCliente & { id: string; criadoEm: string };
const KEY = "portal-uso-mutuo:carteira";
const listeners = new Set<() => void>();

function novoId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `carteira-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function dividirRegistro(dados: DadosCliente, id: string, criadoEm: string): CarteiraRegistro[] {
  return separarDadosPorMunicipio(dados).map((registro, indice) => ({
    ...registro,
    id: indice === 0 ? id : novoId(),
    criadoEm,
  }));
}

export function readCarteira(): CarteiraRegistro[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    let migrou = false;
    const registros = parsed.flatMap((item) => {
      if (!Array.isArray(item.municipios) || item.municipios.length > 1 || !item.id || !item.criadoEm) migrou = true;
      return dividirRegistro(
        normalizarDadosCliente(item),
        item.id || novoId(),
        item.criadoEm || new Date().toISOString(),
      );
    });
    if (migrou) window.localStorage.setItem(KEY, JSON.stringify(registros));
    return registros;
  } catch {
    return [];
  }
}

export function salvarCarteira(dados: DadosCliente, id?: string | null): CarteiraRegistro[] {
  const registros = readCarteira();
  const existente = registros.find((registro) => registro.id === id);
  const criadoEm = existente?.criadoEm ?? new Date().toISOString();
  const novos = dividirRegistro(normalizarDadosCliente(dados), existente?.id ?? novoId(), criadoEm);
  const proximos = existente
    ? registros.flatMap((item) => item.id === id ? novos : [item])
    : [...novos, ...registros];
  window.localStorage.setItem(KEY, JSON.stringify(proximos));
  listeners.forEach((listener) => listener());
  return novos;
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
