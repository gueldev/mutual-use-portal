import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  FileWarning,
  Save,
  XCircle,
} from "lucide-react";

import MultiSelect from "@/components/MultiSelect";
import { maskCNPJ, isValidCNPJ, EMAIL_REGEX } from "@/lib/cnpj";
import { addNota } from "@/lib/notas-store";
import { PE_MUNICIPIOS } from "@/lib/pe-municipios";

import { cn } from "@/lib/utils";

/* ---------- catálogo de motivos de reprovação ---------- */

type DocKey =
  | "solicitacaoAnalise"
  | "cartaAmbiental"
  | "artTrt"
  | "memorialDescritivo"
  | "kmz"
  | "planilhaPostes"
  | "plantas"
  | "cartaRedeInstalada";

const REPROVA_DOCS: { key: DocKey; label: string; options: string[] }[] = [
  {
    key: "solicitacaoAnalise",
    label: "Solicitação de Análise",
    options: [
      "ENVIADO",
      "PONTOS",
      "EMPRESA",
      "END. OBRA",
      "ROTA",
      "RESPONSÁVEL TÉCNICO",
      "CONTATOS",
      "ASSINATURA",
      "OUTRA",
    ],
  },
  {
    key: "cartaAmbiental",
    label: "Carta Ambiental",
    options: ["ENVIADO", "VALIDADE", "OUTRA"],
  },
  {
    key: "artTrt",
    label: "ART / TRT",
    options: [
      "ENVIADO",
      "RESPONSÁVEL TÉCNICO",
      "EMPRESA",
      "END. OBRA",
      "PROJETO/EXECUÇÃO",
      "EXTENSÃO CABO",
      "ASSINATURA",
      "OUTRA",
    ],
  },
  {
    key: "memorialDescritivo",
    label: "Memorial Descritivo",
    options: [
      "ENVIADO",
      "ROTA",
      "CABO",
      "ACESSÓRIOS",
      "EQUIPAMENTOS",
      "PRINCÍPIOS FUNCIONAIS",
      "INSTALAÇÃO",
      "PLAQUETA",
      "PONTOS",
      "CÁLCULO DE ESFORÇO",
      "EMPRESAS CONTRATADAS",
      "SEGURANÇA",
      "OUTRA",
    ],
  },
  {
    key: "kmz",
    label: "KMZ",
    options: ["ENVIADO", "QUANTIDADE", "ORDEM", "CIDADE", "OUTRA"],
  },
  {
    key: "planilhaPostes",
    label: "Planilha de Postes",
    options: [
      "ENVIADO",
      "QUANTIDADE",
      "LOCALIZAÇÃO",
      "ESFORÇO / ALTURA",
      "BARRAMENTO",
      "LAT / LON",
      "FIXAÇÃO",
      "CORDOALHA",
      "ÂNGULO",
      "FORÇA RESULTANTE",
      "COMPARTILHADO",
      "OUTRA",
    ],
  },
  {
    key: "plantas",
    label: "Plantas",
    options: [
      "ENVIADO",
      "ORDEM",
      "ESFORÇO / ALTURA",
      "ENDEREÇO",
      "QUANTIDADE",
      "ÂNGULOS",
      "NOTAS",
      "ROTA",
      "OUTRA",
    ],
  },
  {
    key: "cartaRedeInstalada",
    label: "Carta de Rede Instalada",
    options: ["ENVIADO", "ASSINATURA", "OUTRA"],
  },
];

/* ---------- modelo de dados ---------- */

type Reprova = Record<DocKey, { motivos: string[]; outro: string }>;

const emptyReprova = (): Reprova =>
  REPROVA_DOCS.reduce((acc, d) => {
    acc[d.key] = { motivos: [], outro: "" };
    return acc;
  }, {} as Reprova);

const ANALISTAS = [
  "FELIPE TELES FONSECA",
  "JAILSON SEVERINO DOS SANTOS",
  "ALESSANDRA FELICIANO DA SILVA",
  "MARLON DAVIS GUIMARAES CARNEIRO",
  "NADIRLENE CAVALCANTI LEITE LINS E MELLO",
];

type Form = {
  nota: string;
  analisadoPor: string;
  pontosFaturados: string;
  equipamentosFaturados: string;
  pontosAgrupados: string;
  projeto5g: string;
  etapaAnalise: string;
  etapaOutra: string;
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
};

const initialForm: Form = {
  nota: "",
  analisadoPor: "",
  pontosFaturados: "",
  equipamentosFaturados: "",
  pontosAgrupados: "",
  projeto5g: "",
  etapaAnalise: "",
  etapaOutra: "",
  empresa: "",
  cnpj: "",
  enderecoEmpresa: "",
  municipio: "",
  responsavel: "",
  email: "",
  dataAnalise: "",
  statusNota: "",
  observacao: "",
  valorPonto: "",
  pontosRevelia: "",
  dataLancamento: "",
};

/* ---------- combobox de municípios (digitável, restrito à lista) ---------- */

function MunicipioCombobox({
  value,
  onChange,
  onBlur,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (ev: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(ev.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const term = (open ? query : value).trim().toLowerCase();
  const options = useMemo(
    () => (term ? PE_MUNICIPIOS.filter((m) => m.toLowerCase().includes(term)) : PE_MUNICIPIOS),
    [term],
  );

  return (
    <div ref={boxRef} className="relative">
      <input
        value={open ? query : value}
        onFocus={() => {
          setQuery(value);
          setOpen(true);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onBlur={() => {
          if (!open) onBlur();
        }}
        role="combobox"
        aria-expanded={open}
        placeholder="Ex.: Recife"
        className={className}
        autoComplete="off"
      />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      {open && (
        <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-panel">
          {options.length === 0 ? (
            <li className="px-3 py-2 text-xs text-muted-foreground">
              Nenhum município encontrado.
            </li>
          ) : (
            options.map((m) => (
              <li key={m}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(m);
                    setOpen(false);
                    onBlur();
                  }}
                  className={cn(
                    "w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:bg-secondary",
                    m === value && "bg-secondary font-medium",
                  )}
                >
                  {m}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}


const intError = (v: string, label: string) => {
  if (v.trim() === "") return `${label} é obrigatório.`;
  if (!/^\d+$/.test(v.trim())) return "Informe um número inteiro válido (sem negativos).";
  if (Number(v) < 0) return "O valor deve ser maior ou igual a 0.";
  return "";
};

type ErrKey = keyof Form | "reprova" | `outro_${DocKey}`;
type Errors = Partial<Record<ErrKey, string>>;

function validate(f: Form, reprova: Reprova): Errors {
  const e: Errors = {};

  if (!f.nota.trim()) e.nota = "Nota é obrigatória.";
  if (!f.analisadoPor) e.analisadoPor = "Selecione quem analisou.";

  const pf = intError(f.pontosFaturados, "Quantidade de pontos faturados");
  if (pf) e.pontosFaturados = pf;
  const ef = intError(f.equipamentosFaturados, "Quantidade de equipamentos faturados");
  if (ef) e.equipamentosFaturados = ef;
  const pa = intError(f.pontosAgrupados, "Quantidade de pontos agrupados");
  if (pa) e.pontosAgrupados = pa;

  if (!f.projeto5g) e.projeto5g = "Informe se é Projeto 5G.";
  if (!f.etapaAnalise) e.etapaAnalise = "Selecione a etapa da análise.";
  else if (f.etapaAnalise === "Outra" && !f.etapaOutra.trim()) e.etapaOutra = "Informe a etapa.";

  if (!f.empresa.trim()) e.empresa = "Nome da Empresa é obrigatório.";
  if (!f.enderecoEmpresa.trim()) e.enderecoEmpresa = "Endereço Empresa é obrigatório.";


  const cnpjDigits = f.cnpj.replace(/\D/g, "");
  if (!cnpjDigits) e.cnpj = "CNPJ é obrigatório.";
  else if (cnpjDigits.length !== 14) e.cnpj = "O CNPJ deve conter 14 números.";
  else if (!isValidCNPJ(f.cnpj)) e.cnpj = "CNPJ inválido.";

  if (!f.municipio.trim()) e.municipio = "Município da obra é obrigatório.";
  else if (!PE_MUNICIPIOS.some((m) => m.toLowerCase() === f.municipio.trim().toLowerCase()))
    e.municipio = "Selecione um município de Pernambuco da lista.";
  if (!f.responsavel.trim()) e.responsavel = "Nome do Responsável Técnico é obrigatório.";

  if (!f.email.trim()) e.email = "E-mail é obrigatório.";
  else if (!EMAIL_REGEX.test(f.email.trim())) e.email = "Formato de e-mail inválido.";

  if (!f.dataAnalise) e.dataAnalise = "Data da análise é obrigatória.";
  if (!f.statusNota) e.statusNota = "Selecione o status da nota após a análise.";
  if (!f.pontosRevelia) e.pontosRevelia = "Informe se há pontos à Revelia.";

  if (f.valorPonto.trim() && Number(f.valorPonto) < 0)
    e.valorPonto = "O valor não pode ser negativo.";

  if (f.statusNota === "REPROVADO") {
    const total = REPROVA_DOCS.reduce((n, d) => n + reprova[d.key].motivos.length, 0);
    if (total === 0)
      e.reprova = "Selecione ao menos um motivo de reprovação em um dos documentos.";
    REPROVA_DOCS.forEach((d) => {
      const item = reprova[d.key];
      if (item.motivos.includes("OUTRA") && !item.outro.trim())
        e[`outro_${d.key}` as ErrKey] = "Descreva o outro motivo.";
    });
  }

  return e;
}

/* ---------- primitivos visuais ---------- */

const inputCls =
  "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-brand";

function SectionCard({
  n,
  icon,
  title,
  subtitle,
  children,
}: {
  n: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <header className="mb-5 flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-brand-dark">
          {icon}
        </span>
        <div>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {n}
          </p>
          <h2 className="text-base font-semibold text-primary">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </header>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  error,
  touched,
  required = true,
  hint,
  full,
  children,
}: {
  label: string;
  error?: string | undefined;
  touched?: boolean | undefined;
  required?: boolean;
  hint?: string | undefined;
  full?: boolean | undefined;
  children: React.ReactNode;
}) {
  const showError = Boolean(touched && error);
  return (
    <div className={cn("flex flex-col gap-1.5", full && "md:col-span-2")}>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
        {label}
        {required ? (
          <span className="text-brand">*</span>
        ) : (
          <span className="text-[0.68rem] font-normal text-muted-foreground">(opcional)</span>
        )}
      </label>
      <div className={cn("rounded-xl", showError && "ring-2 ring-destructive/35")}>{children}</div>
      {showError ? (
        <p className="flex items-center gap-1 text-[0.7rem] font-medium text-destructive">
          <AlertCircle className="size-3" /> {error}
        </p>
      ) : hint ? (
        <p className="text-[0.7rem] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

/* ---------- componente principal ---------- */

export default function FormularioNotas() {
  const [form, setForm] = useState<Form>(initialForm);
  const [reprova, setReprova] = useState<Reprova>(emptyReprova);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [openDoc, setOpenDoc] = useState<DocKey | null>("solicitacaoAnalise");
  const [saved, setSaved] = useState<string>("");
  const [log, setLog] = useState<{ at: string; action: string; detail: string }[]>([]);

  const errors = useMemo(() => validate(form, reprova), [form, reprova]);
  const errorCount = Object.keys(errors).length;

  const set = <K extends keyof Form>(k: K, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setSaved("");
  };
  const blur = (k: string) => setTouched((p) => ({ ...p, [k]: true }));
  const t = (k: string) => Boolean(touched[k]);

  const setDoc = (key: DocKey, patch: Partial<{ motivos: string[]; outro: string }>) => {
    setReprova((p) => ({ ...p, [key]: { ...p[key], ...patch } }));
    setSaved("");
  };

  const selectedCount = REPROVA_DOCS.reduce((n, d) => n + reprova[d.key].motivos.length, 0);

  const handleSave = () => {
    setTouched((p) => {
      const next: Record<string, boolean> = { ...p };
      Object.keys(initialForm).forEach((k) => {
        next[k] = true;
      });
      next["reprova"] = true;
      REPROVA_DOCS.forEach((d) => {
        next[`outro_${d.key}`] = true;
      });
      return next;
    });

    if (errorCount > 0) {
      setSaved("erro");
      return;
    }

    const motivosReprovacao =
      form.statusNota === "REPROVADO"
        ? REPROVA_DOCS.filter((d) => reprova[d.key].motivos.length > 0).map((d) => ({
            documento: d.label,
            motivos: reprova[d.key].motivos,
            outro: reprova[d.key].outro.trim() || null,
          }))
        : [];

    const etapa = form.etapaAnalise === "Outra" ? form.etapaOutra.trim() : form.etapaAnalise;

    addNota({
      nota: form.nota.trim(),
      analisadoPor: form.analisadoPor,
      pontosFaturados: form.pontosFaturados,
      equipamentosFaturados: form.equipamentosFaturados,
      pontosAgrupados: form.pontosAgrupados,
      projeto5g: form.projeto5g,
      etapaAnalise: etapa,
      empresa: form.empresa.trim(),
      cnpj: form.cnpj,
      enderecoEmpresa: form.enderecoEmpresa.trim(),
      municipio: form.municipio.trim(),
      responsavel: form.responsavel.trim(),
      email: form.email.trim(),
      dataAnalise: form.dataAnalise,
      statusNota: form.statusNota,
      observacao: form.observacao.trim(),
      valorPonto: form.valorPonto,
      pontosRevelia: form.pontosRevelia,
      dataLancamento: form.dataLancamento,
      motivosReprovacao,
    });

    setSaved(form.statusNota);

    setLog((p) => [
      {
        at: new Date().toLocaleString("pt-BR"),
        action: `Análise ${form.statusNota}`,
        detail: `${form.empresa} · etapa ${etapa}${
          motivosReprovacao.length
            ? ` · ${selectedCount} motivo(s) em ${motivosReprovacao.length} documento(s)`
            : ""
        }`,
      },
      ...p,
    ]);
  };

  const handleCancel = () => {
    setForm(initialForm);
    setReprova(emptyReprova());
    setTouched({});
    setSaved("");
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <img
          src="/favicon.png"
          alt="Neoenergia"
          width={150}
          height={44}
          className="h-11 w-auto object-contain"
        />
        <h1 className="mt-4 text-2xl font-semibold text-primary md:text-[1.7rem]">
          Formulário de Notas
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Registro da análise técnica da nota de projeto de uso mútuo
        </p>
      </div>

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <SectionCard
          n="Bloco 1"
          icon={<ClipboardList className="size-5" />}
          title="Dados da análise"
          subtitle="Quantitativos faturados e identificação da etapa"
        >
          <Field label="Nota" error={errors.nota} touched={t("nota")} hint="Número da nota.">
            <input
              value={form.nota}
              onChange={(e) => set("nota", e.target.value)}
              onBlur={() => blur("nota")}
              inputMode="numeric"
              placeholder="Ex.: 9201234567"
              className={inputCls}
            />
          </Field>

          <Field label="Analisado por" error={errors.analisadoPor} touched={t("analisadoPor")}>
            <select
              value={form.analisadoPor}
              onChange={(e) => set("analisadoPor", e.target.value)}
              onBlur={() => blur("analisadoPor")}
              className={inputCls}
            >
              <option value="">Selecione</option>
              {ANALISTAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </Field>

          <Field

            label="Quantidade de pontos faturados"
            error={errors.pontosFaturados}
            touched={t("pontosFaturados")}
          >
            <input
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={form.pontosFaturados}
              onChange={(e) => set("pontosFaturados", e.target.value)}
              onBlur={() => blur("pontosFaturados")}
              placeholder="0"
              className={inputCls}
            />
          </Field>

          <Field
            label="Quantidade de equipamentos faturados"
            error={errors.equipamentosFaturados}
            touched={t("equipamentosFaturados")}
          >
            <input
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={form.equipamentosFaturados}
              onChange={(e) => set("equipamentosFaturados", e.target.value)}
              onBlur={() => blur("equipamentosFaturados")}
              placeholder="0"
              className={inputCls}
            />
          </Field>

          <Field
            label="Quantidade de pontos agrupados"
            error={errors.pontosAgrupados}
            touched={t("pontosAgrupados")}
          >
            <input
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={form.pontosAgrupados}
              onChange={(e) => set("pontosAgrupados", e.target.value)}
              onBlur={() => blur("pontosAgrupados")}
              placeholder="0"
              className={inputCls}
            />
          </Field>



          <Field label="Projeto 5G?" error={errors.projeto5g} touched={t("projeto5g")}>
            <select
              value={form.projeto5g}
              onChange={(e) => set("projeto5g", e.target.value)}
              onBlur={() => blur("projeto5g")}
              className={inputCls}
            >
              <option value="">Selecione</option>
              <option value="SIM">SIM</option>
              <option value="NÃO">NÃO</option>
            </select>
          </Field>

          <Field
            label="Essa é a análise de etapa"
            error={errors.etapaAnalise}
            touched={t("etapaAnalise")}
          >
            <select
              value={form.etapaAnalise}
              onChange={(e) => set("etapaAnalise", e.target.value)}
              onBlur={() => blur("etapaAnalise")}
              className={inputCls}
            >
              <option value="">Selecione</option>
              {["1", "2", "3", "4", "Outra"].map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>

          {form.etapaAnalise === "Outra" && (
            <Field
              label="Informe a etapa"
              error={errors.etapaOutra}
              touched={t("etapaOutra")}
              full
            >
              <input
                value={form.etapaOutra}
                onChange={(e) => set("etapaOutra", e.target.value)}
                onBlur={() => blur("etapaOutra")}
                placeholder="Ex.: 5ª etapa complementar"
                className={inputCls}
              />
            </Field>
          )}
        </SectionCard>

        <SectionCard
          n="Bloco 2"
          icon={<FileWarning className="size-5" />}
          title="Empresa e responsável técnico"
          subtitle="Identificação do provedor e contato para devolutiva"
        >
          <Field label="Nome da Empresa" error={errors.empresa} touched={t("empresa")}>
            <input
              value={form.empresa}
              onChange={(e) => set("empresa", e.target.value)}
              onBlur={() => blur("empresa")}
              placeholder="Razão social do provedor"
              className={inputCls}
            />
          </Field>

          <Field
            label="CNPJ"
            error={errors.cnpj}
            touched={t("cnpj")}
            hint="Somente números — a máscara é aplicada automaticamente."
          >
            <input
              value={form.cnpj}
              onChange={(e) => set("cnpj", maskCNPJ(e.target.value))}
              onBlur={() => blur("cnpj")}
              inputMode="numeric"
              placeholder="00.000.000/0000-00"
              className={inputCls}
            />
          </Field>

          <Field
            label="Endereço Empresa"
            error={errors.enderecoEmpresa}
            touched={t("enderecoEmpresa")}
            full
          >
            <input
              value={form.enderecoEmpresa}
              onChange={(e) => set("enderecoEmpresa", e.target.value)}
              onBlur={() => blur("enderecoEmpresa")}
              placeholder="Rua, número, bairro, cidade"
              className={inputCls}
            />
          </Field>



          <Field label="Município da obra" error={errors.municipio} touched={t("municipio")}>
            <MunicipioCombobox
              value={form.municipio}
              onChange={(v) => set("municipio", v)}
              onBlur={() => blur("municipio")}
              className={inputCls}
            />
          </Field>

          <Field
            label="Nome do Responsável Técnico"
            error={errors.responsavel}
            touched={t("responsavel")}
          >
            <input
              value={form.responsavel}
              onChange={(e) => set("responsavel", e.target.value)}
              onBlur={() => blur("responsavel")}
              placeholder="Nome completo"
              className={inputCls}
            />
          </Field>

          <Field
            label="E-mail do Responsável Técnico"
            error={errors.email}
            touched={t("email")}
          >

            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              onBlur={() => blur("email")}
              placeholder="nome@empresa.com.br"
              className={inputCls}
            />
          </Field>

          <Field label="Data da análise" error={errors.dataAnalise} touched={t("dataAnalise")}>
            <input
              type="date"
              value={form.dataAnalise}
              onChange={(e) => set("dataAnalise", e.target.value)}
              onBlur={() => blur("dataAnalise")}
              className={inputCls}
            />
          </Field>
        </SectionCard>

        <SectionCard
          n="Bloco 3"
          icon={
            form.statusNota === "REPROVADO" ? (
              <XCircle className="size-5" />
            ) : (
              <CheckCircle2 className="size-5" />
            )
          }
          title="Status da nota após a análise"
          subtitle="Os motivos de reprovação aparecem apenas quando o status é REPROVADO"
        >
          <Field label="Status da nota" error={errors.statusNota} touched={t("statusNota")} full>
            <select
              value={form.statusNota}
              onChange={(e) => set("statusNota", e.target.value)}
              onBlur={() => blur("statusNota")}
              className={inputCls}
            >
              <option value="">Selecione</option>
              <option value="APROVADO">APROVADO</option>
              <option value="REPROVADO">REPROVADO</option>
            </select>
          </Field>

          {form.statusNota === "APROVADO" && (
            <div className="animate-rise flex items-center gap-2 rounded-xl border border-brand/40 bg-secondary/60 px-4 py-3 text-xs font-medium text-brand-dark md:col-span-2">
              <CheckCircle2 className="size-4 shrink-0" />
              Nota aprovada — siga para os campos finais de lançamento.
            </div>
          )}

          {form.statusNota === "REPROVADO" && (
            <div className="animate-rise space-y-2 md:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-highlight">
                  Motivos da reprovação
                </p>
                <span className="rounded-md bg-secondary px-2 py-0.5 text-[0.68rem] font-semibold text-secondary-foreground">
                  {selectedCount} motivo(s) selecionado(s)
                </span>
              </div>

              <div className="divide-y divide-border rounded-xl border border-border">
                {REPROVA_DOCS.map((d) => {
                  const item = reprova[d.key];
                  const isOpen = openDoc === d.key;
                  return (
                    <div key={d.key}>
                      <button
                        type="button"
                        onClick={() => setOpenDoc(isOpen ? null : d.key)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-secondary/40"
                      >
                        <span className="flex-1">{d.label}</span>
                        {item.motivos.length > 0 && (
                          <span className="rounded-md bg-primary px-2 py-0.5 text-[0.65rem] font-bold text-primary-foreground">
                            {item.motivos.length}
                          </span>
                        )}
                        <ChevronDown
                          className={cn(
                            "size-4 text-muted-foreground transition-transform duration-300",
                            isOpen && "rotate-180",
                          )}
                        />
                      </button>
                      {isOpen && (
                        <div className="space-y-3 border-t border-border bg-surface-2/60 px-4 py-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-foreground">
                              Motivos de reprovação — {d.label}
                            </label>
                            <MultiSelect
                              options={d.options}
                              value={item.motivos}
                              onChange={(next) => setDoc(d.key, { motivos: next })}
                              placeholder="Selecione um ou mais motivos"
                            />
                          </div>
                          {item.motivos.includes("OUTRA") && (
                            <Field
                              label="Descreva outro motivo"
                              error={errors[`outro_${d.key}` as ErrKey]}
                              touched={t(`outro_${d.key}`)}
                              full
                            >
                              <input
                                value={item.outro}
                                onChange={(e) => setDoc(d.key, { outro: e.target.value })}
                                onBlur={() => blur(`outro_${d.key}`)}
                                placeholder="Detalhe o motivo"
                                className={inputCls}
                              />
                            </Field>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {t("reprova") && errors.reprova && (
                <p className="flex items-center gap-1 text-[0.7rem] font-medium text-destructive">
                  <AlertCircle className="size-3" /> {errors.reprova}
                </p>
              )}
            </div>
          )}
        </SectionCard>

        <SectionCard
          n="Bloco 4"
          icon={<CalendarDays className="size-5" />}
          title="Informações finais"
          subtitle="Observações, valor do ponto e lançamento da rede"
        >
          <Field label="Alguma observação?" required={false} full>
            <textarea
              rows={3}
              value={form.observacao}
              onChange={(e) => set("observacao", e.target.value)}
              placeholder="Observações da análise (opcional)"
              className={cn(inputCls, "resize-y")}
            />
          </Field>

          <Field
            label="Qual o valor do ponto para esse provedor?"
            required={false}
            error={errors.valorPonto}
            touched={t("valorPonto")}
            hint="Informe em reais (R$)."
          >
            <input
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={form.valorPonto}
              onChange={(e) => set("valorPonto", e.target.value)}
              onBlur={() => blur("valorPonto")}
              placeholder="0,00"
              className={inputCls}
            />
          </Field>

          <Field
            label="Esse projeto possui pontos à Revelia?"
            error={errors.pontosRevelia}
            touched={t("pontosRevelia")}
          >
            <select
              value={form.pontosRevelia}
              onChange={(e) => set("pontosRevelia", e.target.value)}
              onBlur={() => blur("pontosRevelia")}
              className={inputCls}
            >
              <option value="">Selecione</option>
              <option value="SIM">SIM</option>
              <option value="NÃO">NÃO</option>
            </select>
          </Field>

          <Field label="Qual a data de Lançamento da Rede?" required={false} full>
            <input
              type="date"
              value={form.dataLancamento}
              onChange={(e) => set("dataLancamento", e.target.value)}
              className={inputCls}
            />
          </Field>
        </SectionCard>

        {saved === "erro" && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-xs font-medium text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {errorCount} campo(s) pendente(s) ou inválido(s). Revise os destaques acima.
          </div>
        )}
        {(saved === "APROVADO" || saved === "REPROVADO") && (
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-medium",
              saved === "APROVADO"
                ? "border border-brand/40 bg-secondary/60 text-brand-dark"
                : "border border-highlight/50 bg-highlight/10 text-highlight",
            )}
          >
            {saved === "APROVADO" ? (
              <CheckCircle2 className="size-4 shrink-0" />
            ) : (
              <XCircle className="size-4 shrink-0" />
            )}
            Análise salva como {saved}.
            {saved === "REPROVADO" && " Devolutiva com os motivos será enviada ao cliente."}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 pb-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-xl border border-input px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Save className="size-4" />
            Salvar análise
          </button>
        </div>

        {log.length > 0 && (
          <section className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-primary">Histórico de ações</h3>
            <ul className="mt-3 space-y-2">
              {log.map((l, i) => (
                <li key={i} className="flex flex-wrap gap-2 text-[0.72rem] text-muted-foreground">
                  <span className="font-mono">{l.at}</span>
                  <span className="font-semibold text-foreground">{l.action}</span>
                  <span>{l.detail}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </form>
    </div>
  );
}
