import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileUp,
  HelpCircle,
  History,
  Info,
  MapPin,
  Paperclip,
  Ruler,
  Save,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import { EMAIL_REGEX, isValidCNPJ, maskCNPJ } from "@/lib/cnpj";
import { PE_MUNICIPIOS } from "@/lib/pe-municipios";
import { cn } from "@/lib/utils";

type Status = "" | "Aprovado" | "Pendente" | "Rejeitado";

type Form = {
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
  status: Status;
  justificativa: string;
};

const initialForm: Form = {
  cnpj: "",
  razaoSocial: "",
  plaqueta: "",
  tn: "",
  notaProjeto: "",
  pontosNovos: "",
  pontosAgrupados: "",
  equipamentos: "",
  projeto5g: "",
  municipio: "",
  rota: "",
  responsavel: "",
  email: "",
  status: "",
  justificativa: "",
};

type DocKey = "projetoTecnico" | "art" | "memorial" | "planta" | "comprovanteCnpj";

const DOCS: {
  key: DocKey;
  label: string;
  accept: string;
  exts: string[];
  required: boolean;
  multiple?: boolean;
}[] = [
  {
    key: "projetoTecnico",
    label: "Projeto Técnico",
    accept: ".pdf",
    exts: ["pdf"],
    required: true,
  },
  {
    key: "art",
    label: "ART do Responsável Técnico",
    accept: ".pdf,.jpg,.jpeg,.png",
    exts: ["pdf", "jpg", "jpeg", "png"],
    required: true,
  },
  {
    key: "memorial",
    label: "Memorial Descritivo",
    accept: ".pdf",
    exts: ["pdf"],
    required: true,
  },
  {
    key: "planta",
    label: "Planta / Croqui / DWG",
    accept: ".pdf,.dwg,.jpg,.jpeg,.png",
    exts: ["pdf", "dwg", "jpg", "jpeg", "png"],
    required: true,
    multiple: true,
  },
  {
    key: "comprovanteCnpj",
    label: "Comprovante de CNPJ",
    accept: ".pdf",
    exts: ["pdf"],
    required: false,
  },
];

const intError = (v: string, label: string) => {
  if (v.trim() === "") return `${label} é obrigatório.`;
  if (!/^\d+$/.test(v.trim())) return "Informe um número inteiro válido.";
  if (Number(v) < 0) return "O valor deve ser maior ou igual a 0.";
  return "";
};

function validate(f: Form): Partial<Record<keyof Form, string>> {
  const e: Partial<Record<keyof Form, string>> = {};

  if (!f.cnpj) e.cnpj = "CNPJ é obrigatório.";
  else if (f.cnpj.length !== 18) e.cnpj = "O CNPJ deve ter 18 caracteres com máscara.";
  else if (!isValidCNPJ(f.cnpj)) e.cnpj = "CNPJ inválido (dígito verificador incorreto).";

  if (!f.razaoSocial.trim()) e.razaoSocial = "Razão Social é obrigatória.";
  if (!f.plaqueta.trim()) e.plaqueta = "Nome da Plaqueta é obrigatório.";

  if (!f.tn.trim()) e.tn = "Número da TN é obrigatório.";
  else if (!/^\d{10}$/.test(f.tn)) e.tn = "A TN deve conter exatamente 10 dígitos.";

  if (!f.notaProjeto.trim()) e.notaProjeto = "Número da Nota de Projeto é obrigatório.";
  else if (!/^\d{10}$/.test(f.notaProjeto))
    e.notaProjeto = "A Nota de Projeto deve conter exatamente 10 dígitos.";

  const pn = intError(f.pontosNovos, "Quantidade de Pontos Novos");
  if (pn) e.pontosNovos = pn;
  const pa = intError(f.pontosAgrupados, "Quantidade de Pontos Agrupados");
  if (pa) e.pontosAgrupados = pa;
  const eq = intError(f.equipamentos, "Quantidade de Equipamentos");
  if (eq) e.equipamentos = eq;

  if (!f.projeto5g) e.projeto5g = "Informe se é Projeto 5G.";
  if (!f.municipio) e.municipio = "Município do Projeto é obrigatório.";
  if (!f.rota.trim()) e.rota = "Nome da Rota é obrigatório.";

  if (!f.responsavel.trim()) e.responsavel = "Nome do Responsável Técnico é obrigatório.";
  else if (f.responsavel.trim().length < 3) e.responsavel = "Informe no mínimo 3 caracteres.";

  if (!f.email.trim()) e.email = "E-mail é obrigatório.";
  else if (!EMAIL_REGEX.test(f.email.trim())) e.email = "Formato de e-mail inválido.";

  if (!f.status) e.status = "Selecione a classificação da triagem.";
  if ((f.status === "Pendente" || f.status === "Rejeitado") && !f.justificativa.trim())
    e.justificativa = "Justificativa é obrigatória para esta classificação.";

  return e;
}

/* ---------- primitivos visuais ---------- */

function SectionCard({
  n,
  icon,
  title,
  subtitle,
  children,
}: {
  n: number;
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
            Seção {n}
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
  value,
  hint,
  help,
  full,
  children,
}: {
  label: string;
  error?: string | undefined;
  touched?: boolean | undefined;
  value?: string | undefined;
  hint?: string | undefined;
  help?: string | undefined;
  full?: boolean | undefined;
  children: React.ReactNode;
}) {
  const showError = Boolean(touched && error);
  const showOk = Boolean(touched && !error && value);
  return (
    <div className={cn("flex flex-col gap-1.5", full && "md:col-span-2")}>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
        {label} <span className="text-brand">*</span>
        {help && (
          <span className="group relative inline-flex">
            <HelpCircle className="size-3.5 text-muted-foreground" />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-lg bg-primary px-3 py-2 text-[0.7rem] font-normal leading-snug text-primary-foreground opacity-0 shadow-panel transition-opacity group-hover:opacity-100">
              {help}
            </span>
          </span>
        )}
      </label>
      <div
        className={cn(
          "rounded-xl transition-shadow",
          showError && "ring-2 ring-destructive/35",
          showOk && "ring-2 ring-brand/35",
        )}
      >
        {children}
      </div>
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

const inputCls =
  "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-brand";

/* ---------- componente principal ---------- */

export default function TriagemSolicitacao() {
  const [form, setForm] = useState<Form>(initialForm);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [files, setFiles] = useState<Record<DocKey, File[]>>({
    projetoTecnico: [],
    art: [],
    memorial: [],
    planta: [],
    comprovanteCnpj: [],
  });
  const [docErrors, setDocErrors] = useState<Partial<Record<DocKey, string>>>({});
  const [log, setLog] = useState<{ at: string; action: string; detail: string }[]>([]);
  const [saved, setSaved] = useState<Status>("");

  const errors = useMemo(() => validate(form), [form]);

  const requiredFieldKeys = useMemo(() => {
    const keys: (keyof Form)[] = [
      "cnpj",
      "razaoSocial",
      "plaqueta",
      "tn",
      "notaProjeto",
      "pontosNovos",
      "pontosAgrupados",
      "equipamentos",
      "projeto5g",
      "municipio",
      "rota",
      "responsavel",
      "email",
      "status",
    ];
    if (form.status === "Pendente" || form.status === "Rejeitado") keys.push("justificativa");
    return keys;
  }, [form.status]);

  const missingFields = requiredFieldKeys.filter((k) => Boolean(errors[k]));
  const missingDocs = DOCS.filter((d) => d.required && files[d.key].length === 0);
  const totalRequired = requiredFieldKeys.length + DOCS.filter((d) => d.required).length;
  const done = totalRequired - missingFields.length - missingDocs.length;
  const progress = Math.round((done / totalRequired) * 100);
  const canSave = missingFields.length === 0 && missingDocs.length === 0;

  const isTouched = (key: keyof Form) => Boolean(touched[key]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const blur = (key: keyof Form) => setTouched((t) => ({ ...t, [key]: true }));

  const onlyDigits = (v: string, max: number) => v.replace(/\D/g, "").slice(0, max);

  const handleFiles = (doc: (typeof DOCS)[number], list: FileList | null) => {
    if (!list) return;
    const picked = Array.from(list);
    const invalid = picked.filter(
      (f) => !doc.exts.includes((f.name.split(".").pop() ?? "").toLowerCase()),
    );
    if (invalid.length) {
      setDocErrors((e) => ({
        ...e,
        [doc.key]: `Formato não permitido. Aceito: ${doc.exts.join(", ").toUpperCase()}.`,
      }));
      return;
    }
    setDocErrors((e) => ({ ...e, [doc.key]: "" }));
    setFiles((prev) => ({
      ...prev,
      [doc.key]: doc.multiple ? [...prev[doc.key], ...picked] : picked.slice(0, 1),
    }));
  };

  const removeFile = (key: DocKey, name: string) =>
    setFiles((prev) => ({ ...prev, [key]: prev[key].filter((f) => f.name !== name) }));

  const registerLog = (action: string, detail: string) =>
    setLog((l) => [
      {
        at: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "medium" }),
        action,
        detail,
      },
      ...l,
    ]);

  const handleSave = () => {
    setTouched(Object.fromEntries(requiredFieldKeys.map((k) => [k, true])));
    if (!canSave) return;
    setSaved(form.status);
    registerLog(
      form.status === "Aprovado"
        ? "Triagem aprovada"
        : form.status === "Pendente"
          ? "Triagem pendenciada"
          : "Triagem rejeitada",
      `TN ${form.tn} · ${form.razaoSocial} · ${files.planta.length + 3} documento(s) anexado(s)`,
    );
  };

  const handleCancel = () => {
    registerLog("Triagem cancelada", "Formulário limpo pelo usuário");
    setForm(initialForm);
    setTouched({});
    setFiles({ projetoTecnico: [], art: [], memorial: [], planta: [], comprovanteCnpj: [] });
    setDocErrors({});
    setSaved("");
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Cabeçalho / logo */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-panel">
        <div className="bg-gradient-brand px-6 py-5 text-primary-foreground">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground/15 ring-1 ring-primary-foreground/30">
              <Zap className="size-5" strokeWidth={2.5} />
            </span>
            <div className="leading-tight">
              <p className="text-lg font-semibold tracking-tight">neoenergia</p>
              <p className="text-[0.68rem] uppercase tracking-[0.22em] opacity-85">Pernambuco</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3 px-6 py-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-primary">
              Triagem de Solicitação
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Etapa 1 · Uso Mútuo — conferência de dados e documentação do projeto.
            </p>
          </div>
          <span className="rounded-md border border-brand/40 bg-secondary px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-brand-dark">
            {missingFields.length + missingDocs.length === 0
              ? "Pronto para salvar"
              : `${missingFields.length + missingDocs.length} pendência(s)`}
          </span>
        </div>
        <div className="px-6 pb-5">
          <div className="mb-2 flex items-center justify-between text-[0.7rem] font-medium text-muted-foreground">
            <span>Campos obrigatórios preenchidos</span>
            <span>
              {done}/{totalRequired}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-brand transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {/* Seção 1 */}
        <SectionCard
          n={1}
          icon={<Building2 className="size-5" />}
          title="Dados da Empresa Solicitante"
          subtitle="Identificação cadastral do solicitante"
        >
          <Field label="CNPJ" error={errors.cnpj} touched={isTouched("cnpj")} value={form.cnpj}>
            <input
              className={inputCls}
              inputMode="numeric"
              placeholder="00.000.000/0000-00"
              value={form.cnpj}
              onChange={(e) => set("cnpj", maskCNPJ(e.target.value))}
              onBlur={() => blur("cnpj")}
            />
          </Field>
          <Field
            label="Razão Social"
            error={errors.razaoSocial}
            touched={isTouched("razaoSocial")}
            value={form.razaoSocial}
          >
            <input
              className={inputCls}
              placeholder="Nome empresarial completo"
              value={form.razaoSocial}
              onChange={(e) => set("razaoSocial", e.target.value)}
              onBlur={() => blur("razaoSocial")}
            />
          </Field>
        </SectionCard>

        {/* Seção 2 */}
        <SectionCard
          n={2}
          icon={<ClipboardList className="size-5" />}
          title="Identificação do Projeto Técnico"
          subtitle="Dados de referência do projeto"
        >
          <Field
            label="Nome da Plaqueta"
            help="Encontrado no checklist simplificado ou memorial descritivo."
            error={errors.plaqueta}
            touched={isTouched("plaqueta")}
            value={form.plaqueta}
            full
          >
            <input
              className={inputCls}
              placeholder="Ex.: PL-0245-REC"
              value={form.plaqueta}
              onChange={(e) => set("plaqueta", e.target.value)}
              onBlur={() => blur("plaqueta")}
            />
          </Field>
          <Field
            label="Número da TN"
            hint="10 dígitos · origem SAP CRM"
            error={errors.tn}
            touched={isTouched("tn")}
            value={form.tn}
          >
            <input
              className={inputCls}
              inputMode="numeric"
              placeholder="1412345678"
              value={form.tn}
              onChange={(e) => set("tn", onlyDigits(e.target.value, 10))}
              onBlur={() => blur("tn")}
            />
          </Field>
          <Field
            label="Número da Nota de Projeto"
            hint="10 dígitos · origem SAP CCS"
            error={errors.notaProjeto}
            touched={isTouched("notaProjeto")}
            value={form.notaProjeto}
          >
            <input
              className={inputCls}
              inputMode="numeric"
              placeholder="9201234567"
              value={form.notaProjeto}
              onChange={(e) => set("notaProjeto", onlyDigits(e.target.value, 10))}
              onBlur={() => blur("notaProjeto")}
            />
          </Field>
        </SectionCard>

        {/* Seção 3 */}
        <SectionCard
          n={3}
          icon={<Ruler className="size-5" />}
          title="Métricas do Projeto"
          subtitle="Quantitativos e classificação técnica"
        >
          <Field
            label="Pontos Novos"
            error={errors.pontosNovos}
            touched={isTouched("pontosNovos")}
            value={form.pontosNovos}
          >
            <input
              className={inputCls}
              inputMode="numeric"
              min={0}
              placeholder="0"
              value={form.pontosNovos}
              onChange={(e) => set("pontosNovos", onlyDigits(e.target.value, 6))}
              onBlur={() => blur("pontosNovos")}
            />
          </Field>
          <Field
            label="Pontos Agrupados"
            error={errors.pontosAgrupados}
            touched={isTouched("pontosAgrupados")}
            value={form.pontosAgrupados}
          >
            <input
              className={inputCls}
              inputMode="numeric"
              placeholder="0"
              value={form.pontosAgrupados}
              onChange={(e) => set("pontosAgrupados", onlyDigits(e.target.value, 6))}
              onBlur={() => blur("pontosAgrupados")}
            />
          </Field>
          <Field
            label="Quantidade de Equipamentos"
            error={errors.equipamentos}
            touched={isTouched("equipamentos")}
            value={form.equipamentos}
          >
            <input
              className={inputCls}
              inputMode="numeric"
              placeholder="0"
              value={form.equipamentos}
              onChange={(e) => set("equipamentos", onlyDigits(e.target.value, 6))}
              onBlur={() => blur("equipamentos")}
            />
          </Field>
          <Field
            label="Projeto 5G"
            error={errors.projeto5g}
            touched={isTouched("projeto5g")}
            value={form.projeto5g}
          >
            <select
              className={inputCls}
              value={form.projeto5g}
              onChange={(e) => set("projeto5g", e.target.value)}
              onBlur={() => blur("projeto5g")}
            >
              <option value="">Selecione…</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
          </Field>
        </SectionCard>

        {/* Seção 4 */}
        <SectionCard
          n={4}
          icon={<MapPin className="size-5" />}
          title="Localização e Rota"
          subtitle="Município (base IBGE) e rota do projeto"
        >
          <Field
            label="Município do Projeto"
            error={errors.municipio}
            touched={isTouched("municipio")}
            value={form.municipio}
          >
            <select
              className={inputCls}
              value={form.municipio}
              onChange={(e) => set("municipio", e.target.value)}
              onBlur={() => blur("municipio")}
            >
              <option value="">Selecione o município…</option>
              {PE_MUNICIPIOS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nome da Rota" error={errors.rota} touched={isTouched("rota")} value={form.rota}>
            <input
              className={inputCls}
              placeholder="Ex.: Rota Boa Viagem 04"
              value={form.rota}
              onChange={(e) => set("rota", e.target.value)}
              onBlur={() => blur("rota")}
            />
          </Field>
        </SectionCard>

        {/* Seção 5 */}
        <SectionCard
          n={5}
          icon={<UserRound className="size-5" />}
          title="Responsável Técnico"
          subtitle="Contato para devolutivas e pendências"
        >
          <Field
            label="Nome do Responsável Técnico"
            error={errors.responsavel}
            touched={isTouched("responsavel")}
            value={form.responsavel}
          >
            <input
              className={inputCls}
              placeholder="Nome completo"
              value={form.responsavel}
              onChange={(e) => set("responsavel", e.target.value)}
              onBlur={() => blur("responsavel")}
            />
          </Field>
          <Field
            label="E-mail do Responsável Técnico"
            error={errors.email}
            touched={isTouched("email")}
            value={form.email}
          >
            <input
              className={inputCls}
              type="email"
              placeholder="nome@empresa.com.br"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              onBlur={() => blur("email")}
            />
          </Field>
        </SectionCard>

        {/* Seção 6 */}
        <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
          <header className="mb-5 flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-brand-dark">
              <Paperclip className="size-5" />
            </span>
            <div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Seção 6
              </p>
              <h2 className="text-base font-semibold text-primary">Documentação</h2>
              <p className="text-xs text-muted-foreground">
                Anexos obrigatórios para conclusão da triagem
              </p>
            </div>
          </header>

          <div className="space-y-3">
            {DOCS.map((doc) => {
              const list = files[doc.key];
              const err = docErrors[doc.key];
              const ok = list.length > 0;
              return (
                <div
                  key={doc.key}
                  className={cn(
                    "rounded-xl border border-dashed border-input bg-background p-4 transition-colors",
                    ok && "border-solid border-brand/50 bg-secondary/40",
                    err && "border-solid border-destructive/50",
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground",
                          ok && "bg-brand/15 text-brand-dark",
                        )}
                      >
                        {ok ? (
                          <CheckCircle2 className="size-4" />
                        ) : (
                          <FileUp className="size-4" />
                        )}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {doc.label}{" "}
                          {doc.required ? (
                            <span className="text-brand">*</span>
                          ) : (
                            <span className="text-[0.68rem] font-normal text-muted-foreground">
                              (opcional)
                            </span>
                          )}
                        </p>
                        <p className="text-[0.7rem] text-muted-foreground">
                          {doc.exts.join(", ").toUpperCase()}
                          {doc.multiple ? " · múltiplos arquivos" : ""}
                        </p>
                      </div>
                    </div>
                    <label className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-muted">
                      {ok && !doc.multiple ? "Substituir" : "Anexar"}
                      <input
                        type="file"
                        className="hidden"
                        accept={doc.accept}
                        multiple={doc.multiple}
                        onChange={(e) => handleFiles(doc, e.target.files)}
                      />
                    </label>
                  </div>

                  {list.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {list.map((f) => (
                        <li
                          key={f.name}
                          className="flex items-center justify-between gap-2 rounded-lg bg-card px-3 py-1.5 text-xs"
                        >
                          <span className="truncate text-foreground">{f.name}</span>
                          <button
                            type="button"
                            aria-label={`Remover ${f.name}`}
                            onClick={() => removeFile(doc.key, f.name)}
                            className="text-muted-foreground transition-colors hover:text-destructive"
                          >
                            <X className="size-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {err && (
                    <p className="mt-2 flex items-center gap-1 text-[0.7rem] font-medium text-destructive">
                      <AlertCircle className="size-3" /> {err}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Seção 7 */}
        <SectionCard
          n={7}
          icon={<Info className="size-5" />}
          title="Status da Triagem"
          subtitle="Classificação e devolutiva ao cliente"
        >
          <Field
            label="Classificação"
            error={errors.status}
            touched={isTouched("status")}
            value={form.status}
            full
          >
            <select
              className={inputCls}
              value={form.status}
              onChange={(e) => set("status", e.target.value as Status)}
              onBlur={() => blur("status")}
            >
              <option value="">Selecione…</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Pendente">Pendente</option>
              <option value="Rejeitado">Rejeitado</option>
            </select>
          </Field>

          {(form.status === "Pendente" || form.status === "Rejeitado") && (
            <Field
              label="Justificativa"
              error={errors.justificativa}
              touched={isTouched("justificativa")}
              value={form.justificativa}
              full
            >
              <textarea
                className={cn(inputCls, "min-h-24 resize-y")}
                placeholder="Descreva as pendências ou o motivo da rejeição"
                value={form.justificativa}
                onChange={(e) => set("justificativa", e.target.value)}
                onBlur={() => blur("justificativa")}
              />
            </Field>
          )}

          {form.status === "Pendente" && (
            <div className="md:col-span-2 rounded-xl border border-highlight/40 bg-highlight/10 p-4 text-xs leading-relaxed text-foreground">
              <p className="font-semibold text-highlight">Devolutiva por e-mail</p>
              Será enviada devolutiva automática para{" "}
              <span className="font-medium">{form.email || "o e-mail do responsável técnico"}</span>{" "}
              com a lista de pendências informada na justificativa.
            </div>
          )}

          {form.status === "Rejeitado" && (
            <div className="md:col-span-2 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-xs leading-relaxed text-foreground">
              <p className="font-semibold text-destructive">Rejeição da solicitação</p>
              A TN será aberta e encerrada no SAP CRM, com resposta automática ao cliente por
              e-mail informando o motivo da rejeição.
            </div>
          )}

          {form.status === "Aprovado" && (
            <div className="md:col-span-2 flex items-center gap-2 rounded-xl border border-brand/40 bg-secondary p-4 text-xs font-medium text-brand-dark">
              <ArrowRight className="size-4 shrink-0" />
              Ao salvar, o processo segue para a Etapa 2 — Análise Técnica.
            </div>
          )}
        </SectionCard>

        {/* Pendências + ações */}
        {!canSave && (missingFields.length > 0 || missingDocs.length > 0) && (
          <div className="rounded-2xl border border-highlight/40 bg-highlight/10 p-4 text-xs text-foreground">
            <p className="font-semibold text-highlight">Itens obrigatórios pendentes</p>
            <p className="mt-1 text-muted-foreground">
              {missingFields.length} campo(s) e {missingDocs.length} documento(s) aguardando
              preenchimento.
            </p>
          </div>
        )}

        {saved && (
          <div className="rounded-2xl border border-brand/50 bg-secondary p-4 text-sm">
            <p className="flex items-center gap-2 font-semibold text-brand-dark">
              <CheckCircle2 className="size-4" /> Triagem salva como {saved}
            </p>
            {saved === "Aprovado" && (
              <p className="mt-1 text-xs text-muted-foreground">
                Encaminhado para a Etapa 2 — Análise Técnica.
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save className="size-4" />
            Salvar
          </button>
        </div>

        {/* Histórico */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <header className="mb-3 flex items-center gap-2">
            <History className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-primary">Log / Histórico de ações</h2>
          </header>
          {log.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhuma ação registrada nesta triagem.</p>
          ) : (
            <ul className="space-y-2">
              {log.map((l, i) => (
                <li key={i} className="flex gap-3 rounded-lg bg-muted/60 px-3 py-2 text-xs">
                  <span className="shrink-0 font-mono text-muted-foreground">{l.at}</span>
                  <span>
                    <span className="font-semibold text-foreground">{l.action}</span>
                    <span className="text-muted-foreground"> — {l.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
