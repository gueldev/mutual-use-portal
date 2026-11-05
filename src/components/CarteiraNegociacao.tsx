import { useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, FileText, Save, UserRound } from "lucide-react";

import {
  emptyDadosCliente,
  calcularMesesRetroativo,
  calcularValoresNegociacao,
  maskCpfCnpj,
  validarDadosCliente,
  type DadosCliente,
} from "@/lib/carteira-negociacao";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const inputCls =
  "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-brand";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const formatarValor = (valor: string) => valor === "" ? "" : moeda.format(Number(valor));

function OpcaoNegociacao({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className={cn(inputCls, "h-auto min-h-10.5")}>
        <SelectValue placeholder="Selecione" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function Field({
  label,
  error,
  children,
  full,
  required = true,
  hint,
}: {
  label: string;
  error?: string | undefined;
  children: ReactNode;
  full?: boolean;
  required?: boolean;
  hint?: string | undefined;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", full && "md:col-span-2")}>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
        {label} {required && <span className="text-brand">*</span>}
      </label>
      <div className={cn("rounded-xl", error && "ring-2 ring-destructive/35")}>{children}</div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-[0.7rem] font-medium text-destructive">
          <AlertCircle className="size-3" /> {error}
        </p>
      )}
    </div>
  );
}

export default function CarteiraNegociacao() {
  const [dados, setDados] = useState<DadosCliente>(emptyDadosCliente);
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);

  const errors = validarDadosCliente(dados);
  const mesesRetroativo = calcularMesesRetroativo(dados.dataInicio, dados.dataFim);
  const docLen = dados.documento.length;
  const err = (k: keyof DadosCliente) =>
    submitted || (k === "documento" && (docLen === 11 || docLen === 14)) ? errors[k] : undefined;
  const set = (k: keyof DadosCliente, v: string) => {
    setSaved(false);
    setDados((p) => {
      const proximo = { ...p, [k]: v };
      return { ...proximo, ...calcularValoresNegociacao(proximo) };
    });
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <img src="/favicon.png" alt="Neoenergia" width={150} height={44} className="h-11 w-auto object-contain" />
        <h1 className="mt-4 text-2xl font-semibold text-primary md:text-[1.7rem]">
          Carteira de Negociação
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">Cadastro e acompanhamento da negociação com o cliente</p>
      </div>

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
          setSaved(Object.keys(errors).length === 0);
        }}
      >
        <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
          <header className="mb-5 flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-brand-dark">
              <UserRound className="size-5" />
            </span>
            <div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Seção 1</p>
              <h2 className="text-base font-semibold text-primary">Dados do Cliente</h2>
              <p className="text-xs text-muted-foreground">Preenchimento manual das informações do cliente</p>
            </div>
          </header>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nº Notificação" required={false}>
              <input className={inputCls} aria-label="Nº Notificação" value={dados.numeroNotificacao} onChange={(e) => set("numeroNotificacao", e.target.value)} />
            </Field>
            <Field label="Data Notificação" required={false}>
              <input className={inputCls} type="date" aria-label="Data Notificação" value={dados.dataNotificacao} onChange={(e) => set("dataNotificacao", e.target.value)} />
            </Field>
            <Field label="CNPJ/CPF" error={err("documento")}>
              <input
                className={inputCls}
                inputMode="numeric"
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                value={maskCpfCnpj(dados.documento)}
                onChange={(e) => set("documento", e.target.value.replace(/\D/g, "").slice(0, 14))}
              />
            </Field>
            <Field label="Conta Contrato" error={err("cc")}>
              <input className={inputCls} inputMode="numeric" maxLength={10} placeholder="10 dígitos" value={dados.cc} onChange={(e) => set("cc", e.target.value.replace(/\D/g, "").slice(0, 10))} />
            </Field>
            <Field label="Nome do Parceiro" error={err("nomeParceiro")}>
              <input className={inputCls} value={dados.nomeParceiro} onChange={(e) => set("nomeParceiro", e.target.value)} />
            </Field>
            <Field label="Plaqueta" error={err("plaqueta")}>
              <input className={inputCls} value={dados.plaqueta} onChange={(e) => set("plaqueta", e.target.value)} />
            </Field>
            <Field label="Razão Social" error={err("razaoSocial")}>
              <input className={inputCls} value={dados.razaoSocial} onChange={(e) => set("razaoSocial", e.target.value)} />
            </Field>
            <Field label="Nome Fantasia" error={err("nomeFantasia")}>
              <input className={inputCls} value={dados.nomeFantasia} onChange={(e) => set("nomeFantasia", e.target.value)} />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 md:p-6" aria-labelledby="dados-contrato">
          <header className="mb-5 flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-brand-dark">
              <FileText className="size-5" />
            </span>
            <div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Seção 2</p>
              <h2 id="dados-contrato" className="text-base font-semibold text-primary">Dados do Contrato</h2>
            </div>
          </header>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nº Contrato" required={false}>
              <input className={inputCls} aria-label="Nº Contrato" value={dados.numeroContrato} onChange={(e) => set("numeroContrato", e.target.value)} />
            </Field>
            <Field label="Início Vigência" required={false}>
              <input className={inputCls} type="date" aria-label="Início Vigência" value={dados.inicioVigencia} onChange={(e) => set("inicioVigencia", e.target.value)} />
            </Field>
            <Field label="Preço do Ponto" required={false}>
              <input className={inputCls} type="number" step="0.01" aria-label="Preço do Ponto" placeholder="R$ 0,00" value={dados.precoPonto} onChange={(e) => set("precoPonto", e.target.value)} />
            </Field>
            <Field label="Qtd Pontos Censo" required={false}>
              <input className={inputCls} type="number" step="1" aria-label="Qtd Pontos Censo" value={dados.qtdPontosCenso} onChange={(e) => set("qtdPontosCenso", e.target.value)} />
            </Field>
            <Field label="Qtd Pontos à Revelia" required={false}>
              <input className={inputCls} type="number" step="1" aria-label="Qtd Pontos à Revelia" value={dados.qtdPontosRevelia} onChange={(e) => set("qtdPontosRevelia", e.target.value)} />
            </Field>
            <Field label="Data Início" required={false} hint="Lançamento da rede">
              <input className={inputCls} type="date" aria-label="Data Início" value={dados.dataInicio} onChange={(e) => set("dataInicio", e.target.value)} />
            </Field>
            <Field label="Data Fim" required={false} hint="Data final para cálculo do retroativo">
              <input className={inputCls} type="date" aria-label="Data Fim" value={dados.dataFim} onChange={(e) => set("dataFim", e.target.value)} />
            </Field>
            <Field label="Implemento Calculado (R$)" required={false}>
              <input className={cn(inputCls, "bg-muted font-semibold")} aria-label="Implemento Calculado (R$)" readOnly placeholder="R$ —" value={formatarValor(dados.implementoCalculado)} />
            </Field>
            <Field label="Retroativo Calculado (R$)" required={false} hint={mesesRetroativo === null ? undefined : `Período considerado: ${mesesRetroativo} ${mesesRetroativo === 1 ? "mês" : "meses"}`}>
              <input className={cn(inputCls, "bg-muted font-semibold")} aria-label="Retroativo Calculado (R$)" readOnly placeholder="R$ —" value={formatarValor(dados.retroativoCalculado)} />
            </Field>
            <Field label="Focal" required={false}>
              <input className={inputCls} aria-label="Focal" value={dados.focal} onChange={(e) => set("focal", e.target.value)} />
            </Field>
            <Field label="Implemento Acumulado" required={false}>
              <input className={cn(inputCls, "bg-muted font-semibold")} aria-label="Implemento Acumulado" readOnly placeholder="R$ —" value={formatarValor(dados.implementoAcumulado)} />
            </Field>
            <Field label="Mês do Implemento" required={false}>
              <input className={inputCls} type="month" aria-label="Mês do Implemento" value={dados.mesImplemento} onChange={(e) => set("mesImplemento", e.target.value)} />
            </Field>
            <Field label="Condição de Pagamento" required={false}>
              <OpcaoNegociacao label="Condição de Pagamento" value={dados.condicaoPagamento} options={["À Vista", "Parcelado"]} onChange={(v) => set("condicaoPagamento", v)} />
            </Field>
            {dados.condicaoPagamento === "Parcelado" && <Field label="Parcelado: quantidade de parcelas" required={false}>
              <input className={inputCls} type="number" step="1" aria-label="Parcelado: quantidade de parcelas" value={dados.qtdParcelas} onChange={(e) => set("qtdParcelas", e.target.value)} />
            </Field>}
            <Field label="Exceção a Matriz" required={false}>
              <OpcaoNegociacao label="Exceção a Matriz" value={dados.excecaoMatriz} options={["Sim", "Não"]} onChange={(v) => set("excecaoMatriz", v)} />
            </Field>
            <Field label="Desconto" required={false}>
              <OpcaoNegociacao label="Desconto" value={dados.desconto} options={["Sim", "Não"]} onChange={(v) => set("desconto", v)} />
            </Field>
            {dados.desconto === "Sim" && <Field label="% Desconto" required={false}>
              <div className="relative">
                <input className={cn(inputCls, "pr-12")} type="number" step="0.01" aria-label="% Desconto" placeholder="0,00" value={dados.percentualDesconto} onChange={(e) => set("percentualDesconto", e.target.value)} />
                {dados.percentualDesconto !== "" && <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-8 flex items-center text-sm text-muted-foreground">%</span>}
              </div>
            </Field>}
            <Field label="Multa" required={false}>
              <OpcaoNegociacao label="Multa" value={dados.multa} options={["Sim", "Não"]} onChange={(v) => set("multa", v)} />
            </Field>
            {dados.multa === "Sim" && <>
            <Field label="% Multa" required={false}>
              <input className={inputCls} type="number" step="0.01" aria-label="% Multa" placeholder="0,00%" value={dados.percentualMulta} onChange={(e) => set("percentualMulta", e.target.value)} />
            </Field>
            <Field label="Valor da Multa" required={false}>
              <input className={inputCls} type="number" step="0.01" aria-label="Valor da Multa" placeholder="R$ 0,00" value={dados.valorMulta} onChange={(e) => set("valorMulta", e.target.value)} />
            </Field>
            </>}
            <Field label="Retroativo Negociado" required={false}>
              <input className={inputCls} type="number" step="0.01" aria-label="Retroativo Negociado" placeholder="R$ 0,00" value={dados.retroativoNegociado} onChange={(e) => set("retroativoNegociado", e.target.value)} />
            </Field>
            <Field label="Contas à receber Negociado" required={false}>
              <input className={inputCls} type="number" step="0.01" aria-label="Contas à receber Negociado" placeholder="R$ 0,00" value={dados.contasReceberNegociado} onChange={(e) => set("contasReceberNegociado", e.target.value)} />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 md:p-6" aria-labelledby="conclusao-negociacao">
          <header className="mb-5 flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-brand-dark">
              <FileText className="size-5" />
            </span>
            <div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Seção 3</p>
              <h2 id="conclusao-negociacao" className="text-base font-semibold text-primary">Informações da Negociação</h2>
            </div>
          </header>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Observações" required={false} full>
              <textarea className={cn(inputCls, "min-h-24 resize-y")} aria-label="Observações" rows={3} value={dados.observacoes} onChange={(e) => set("observacoes", e.target.value)} />
            </Field>
            <Field label="Município/Local de prestação" required={false}>
              <input className={inputCls} aria-label="Município/Local de prestação" value={dados.municipioLocalPrestacao} onChange={(e) => set("municipioLocalPrestacao", e.target.value)} />
            </Field>
            <Field label="Setor" required={false}>
              <OpcaoNegociacao label="Setor" value={dados.setor} options={["norte", "sul", "metropolitano", "centro", "centro oeste", "oeste"]} onChange={(v) => set("setor", v)} />
            </Field>
            <Field label="Status Projeto" required={false}>
              <OpcaoNegociacao label="Status Projeto" value={dados.statusProjeto} options={["Aguardando", "Aprovado"]} onChange={(v) => set("statusProjeto", v)} />
            </Field>
            <Field label="Origem do Retroativo" required={false}>
              <OpcaoNegociacao label="Origem do Retroativo" value={dados.origemRetroativo} options={["Censo", "Ação de Campo", "Projeto", "Fiscalização", "Notificação", "Baixados", "Ação de Cobrança"]} onChange={(v) => set("origemRetroativo", v)} />
            </Field>
            <Field label="Data de Conclusão da Negociação" required={false}>
              <input className={inputCls} type="date" aria-label="Data de Conclusão da Negociação" value={dados.dataConclusaoNegociacao} onChange={(e) => set("dataConclusaoNegociacao", e.target.value)} />
            </Field>
          </div>
        </section>

        <div className="flex flex-col-reverse items-center justify-end gap-3 sm:flex-row">
          {saved && (
            <p className="mr-auto flex items-center gap-1.5 text-xs font-medium text-brand">
              <CheckCircle2 className="size-4" /> Dados do cliente validados.
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setDados(emptyDadosCliente);
              setSubmitted(false);
              setSaved(false);
            }}
            className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Save className="size-4" /> Salvar
          </Button>
        </div>
      </form>
    </div>
  );
}
