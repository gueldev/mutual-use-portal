import { useState } from "react";
import { Pencil, Search } from "lucide-react";
import { useCarteira } from "@/lib/carteira-store";
import type { DadosCliente } from "@/lib/carteira-negociacao";
import { Button } from "@/components/ui/button";

const columns: { key: keyof DadosCliente; label: string }[] = [
  { key: "numeroNotificacao", label: "Nº Notificação" },
  { key: "dataNotificacao", label: "Data Notificação" },
  { key: "documento", label: "CNPJ/CPF" },
  { key: "cc", label: "CC" },
  { key: "nomeParceiro", label: "Nome do Parceiro" },
  { key: "razaoSocial", label: "Razão Social" },
  { key: "nomeFantasia", label: "Nome Fantasia" },
  { key: "plaqueta", label: "Plaqueta" },
  { key: "numeroContrato", label: "Nº Contrato" },
  { key: "inicioVigencia", label: "Início Vigência" },
  { key: "focal", label: "Focal" },
  { key: "implementoCalculado", label: "Valor do Implemento" },
  { key: "implementoAcumulado", label: "Implemento Acumulado" },
  { key: "mesImplemento", label: "Mês do Implemento" },
  { key: "retroativoCalculado", label: "Retroativo Calculado (Declaração)" },
  { key: "condicaoPagamento", label: "Condição de Pagamento" },
  { key: "excecaoMatriz", label: "Exceção a Matriz" },
  { key: "desconto", label: "Desconto" },
  { key: "percentualDesconto", label: "% Desconto" },
  { key: "multa", label: "Multa" },
  { key: "percentualMulta", label: "% Multa" },
  { key: "valorMulta", label: "Valor da Multa" },
  { key: "retroativoNegociado", label: "Retroativo Negociado" },
  { key: "contasReceberNegociado", label: "Contas à receber Negociado" },
  { key: "municipioLocalPrestacao", label: "Local de Prestação" },
  { key: "setor", label: "Setor" },
  { key: "statusProjeto", label: "Status Projeto" },
  { key: "origemRetroativo", label: "Origem do Retroativo" },
  { key: "dataConclusaoNegociacao", label: "Data de Conclusão da Negociação" },
];
const currencyKeys = new Set<keyof DadosCliente>(["implementoCalculado", "implementoAcumulado", "retroativoCalculado", "valorMulta", "retroativoNegociado", "contasReceberNegociado"]);
const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function BaseCarteira({ onEdit }: { onEdit: (id: string) => void }) {
  const registros = useCarteira();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = registros.filter((registro) =>
    !q || [registro.numeroNotificacao, registro.razaoSocial, registro.nomeParceiro, registro.cc, registro.documento].some((value) => value.toLowerCase().includes(q)) ||
    (q.replace(/\D/g, "").length > 0 && registro.documento.includes(q.replace(/\D/g, "")))
  );
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <header className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-primary">Base da carteira</h1>
        <div className="relative w-full md:w-96">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input aria-label="Pesquisar carteira" placeholder="Pesquisar por Notificação, Razão Social, CC ou CNPJ/CPF" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand" />
        </div>
      </header>
      <p className="mb-3 text-xs text-muted-foreground">{filtered.length} registro(s)</p>
      {filtered.length === 0 ? <p className="py-16 text-center text-sm text-muted-foreground">{registros.length === 0 ? "Nenhuma negociação cadastrada" : "Nenhum registro encontrado"}</p> : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-left text-xs">
            <thead><tr className="border-b border-border bg-secondary/40">{columns.map((column) => <th key={column.key} className="whitespace-nowrap px-4 py-3 font-semibold">{column.label}</th>)}<th className="px-4 py-3">Ações</th></tr></thead>
            <tbody>{filtered.map((registro) => <tr key={registro.id} className="border-b border-border last:border-0 hover:bg-secondary/25">
              {columns.map((column) => {
                const value = registro[column.key];
                const formatted = !value ? "—" : currencyKeys.has(column.key) ? moeda.format(Number(value)) : column.key === "documento" ? value : column.key.startsWith("data") || column.key === "inicioVigencia" ? value.split("-").reverse().join("/") : column.key.startsWith("percentual") ? `${value}%` : value;
                return <td key={column.key} className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatted}</td>;
              })}
              <td className="px-4 py-3"><Button type="button" variant="outline" size="sm" onClick={() => onEdit(registro.id)}><Pencil className="size-3" />Editar</Button></td>
            </tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}