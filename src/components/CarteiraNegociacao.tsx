import { useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Save, UserRound } from "lucide-react";

import {
  emptyDadosCliente,
  maskCpfCnpj,
  validarDadosCliente,
  type DadosCliente,
} from "@/lib/carteira-negociacao";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-brand";

function Field({
  label,
  error,
  children,
  full,
}: {
  label: string;
  error?: string | undefined;
  children: ReactNode;
  full?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", full && "md:col-span-2")}>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
        {label} <span className="text-brand">*</span>
      </label>
      <div className={cn("rounded-xl", error && "ring-2 ring-destructive/35")}>{children}</div>
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
  const docLen = dados.documento.length;
  const err = (k: keyof DadosCliente) =>
    submitted || (k === "documento" && (docLen === 11 || docLen === 14)) ? errors[k] : undefined;
  const set = (k: keyof DadosCliente, v: string) => {
    setSaved(false);
    setDados((p) => ({ ...p, [k]: v }));
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
            <Field label="CNPJ/CPF" error={err("documento")}>
              <input
                className={inputCls}
                inputMode="numeric"
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                value={maskCpfCnpj(dados.documento)}
                onChange={(e) => set("documento", e.target.value.replace(/\D/g, "").slice(0, 14))}
              />
            </Field>
            <Field label="CC" error={err("cc")}>
              <input className={inputCls} inputMode="numeric" placeholder="Somente números" value={dados.cc} onChange={(e) => set("cc", e.target.value.replace(/\D/g, ""))} />
            </Field>
            <Field label="Nome do Parceiro" error={err("nomeParceiro")} full>
              <input className={inputCls} value={dados.nomeParceiro} onChange={(e) => set("nomeParceiro", e.target.value)} />
            </Field>
            <Field label="Razão Social" error={err("razaoSocial")}>
              <input className={inputCls} value={dados.razaoSocial} onChange={(e) => set("razaoSocial", e.target.value)} />
            </Field>
            <Field label="Nome Fantasia" error={err("nomeFantasia")}>
              <input className={inputCls} value={dados.nomeFantasia} onChange={(e) => set("nomeFantasia", e.target.value)} />
            </Field>
          </div>
        </section>

        <div className="flex flex-col-reverse items-center justify-end gap-3 sm:flex-row">
          {saved && (
            <p className="mr-auto flex items-center gap-1.5 text-xs font-medium text-brand">
              <CheckCircle2 className="size-4" /> Dados do cliente validados.
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              setDados(emptyDadosCliente);
              setSubmitted(false);
              setSaved(false);
            }}
            className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Save className="size-4" /> Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
