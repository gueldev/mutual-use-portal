import { useMemo, useState } from "react";
import { ClipboardList, Pencil, Search } from "lucide-react";

import { useNotas } from "@/lib/notas-store";
import { cn } from "@/lib/utils";

const columns: { key: string; label: string }[] = [
  { key: "nota", label: "Nota" },
  { key: "empresa", label: "Razão Social" },
  { key: "cnpj", label: "CNPJ" },
  { key: "analisadoPor", label: "Analisado por" },
  { key: "equipamentosFaturados", label: "Equip. faturados" },
  { key: "pontosFaturados", label: "Pontos faturados" },
  { key: "pontosAgrupados", label: "Pontos agrupados" },
  { key: "projeto5g", label: "Projeto 5G" },
  { key: "etapaAnalise", label: "Etapa" },
  { key: "enderecoEmpresa", label: "Endereço Empresa" },
  { key: "email", label: "E-mail do Resp. Técnico" },
  { key: "municipio", label: "Município" },
  { key: "responsavel", label: "Responsável Técnico" },
  { key: "dataAnalise", label: "Data da análise" },
  { key: "statusNota", label: "Status" },
  { key: "pontosRevelia", label: "Pontos à Revelia" },
  { key: "valorPonto", label: "Valor do ponto" },
  { key: "dataLancamento", label: "Lançamento da rede" },
];

export default function NotasAnalisadas() {
  const notas = useNotas();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notas;
    const digits = q.replace(/\D/g, "");
    return notas.filter((n) => {
      const cnpjDigits = n.cnpj.replace(/\D/g, "");
      return (
        n.nota.toLowerCase().includes(q) ||
        n.empresa.toLowerCase().includes(q) ||
        n.cnpj.toLowerCase().includes(q) ||
        (digits.length > 0 && cnpjDigits.includes(digits))
      );
    });
  }, [notas, query]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <header className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Notas analisadas</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Registros cadastrados através do Formulário de Notas
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar por Nota, Razão Social ou CNPJ"
            className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-brand"
          />
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {filtered.length} registro(s)
          </p>
        </div>

        {notas.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-brand-dark">
              <ClipboardList className="size-6" />
            </span>
            <h2 className="mt-4 text-base font-semibold text-primary">
              Nenhuma nota cadastrada
            </h2>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              As notas salvas no Formulário de Notas aparecem aqui automaticamente.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">
            Nenhum registro encontrado para “{query}”.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      className="whitespace-nowrap px-4 py-3 font-semibold text-foreground"
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((n) => {
                  const row = n as unknown as Record<string, string>;
                  return (
                    <tr
                      key={n.id}
                      className="border-b border-border/70 transition-colors last:border-0 hover:bg-secondary/25"
                    >
                      {columns.map((c) => (
                        <td
                          key={c.key}
                          className={cn(
                            "whitespace-nowrap px-4 py-3 text-muted-foreground",
                            c.key === "nota" && "font-semibold text-foreground",
                          )}
                        >
                          {c.key === "statusNota" ? (
                            <span
                              className={cn(
                                "rounded-md px-2 py-0.5 text-[0.65rem] font-bold",
                                n.statusNota === "APROVADO"
                                  ? "bg-secondary text-brand-dark"
                                  : "bg-highlight/15 text-highlight",
                              )}
                            >
                              {n.statusNota}
                            </span>
                          ) : (
                            (row[c.key] ?? "") || "—"
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
