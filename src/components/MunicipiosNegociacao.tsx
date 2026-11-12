import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertCircle, Check, ChevronDown, Copy, Pencil, Plus, RotateCcw, Search, Trash2, X } from "lucide-react";

import {
  calcularAutomaticosMunicipio,
  calcularMesesRetroativo,
  calcularTotaisMunicipios,
  criarMunicipioNegociacao,
  recalcularMunicipioNegociacao,
  validarMunicipioNegociacao,
  type ErrosMunicipio,
  type MunicipioNegociacao,
} from "@/lib/carteira-negociacao";
import { PE_MUNICIPIOS } from "@/lib/pe-municipios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const inputCls =
  "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-brand";
const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const inteiro = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const formatarMoeda = (valor: string | number) => moeda.format(Number(valor) || 0);

type CampoManual = "implementoCalculado" | "retroativoCalculado";
type CampoObrigatorio = keyof ErrosMunicipio;

function erroVisivel(municipio: MunicipioNegociacao, campo: CampoObrigatorio, submitted: boolean): string | undefined {
  const erro = validarMunicipioNegociacao(municipio)[campo];
  if (campo === "dataFim" && erro?.startsWith("A Data Fim")) return erro;
  return submitted ? erro : undefined;
}

function MensagemErro({ children }: { children?: string | undefined }) {
  if (!children) return null;
  return <p className="mt-1 flex items-start gap-1 text-[0.68rem] font-medium leading-4 text-destructive"><AlertCircle className="mt-0.5 size-3 shrink-0" />{children}</p>;
}

function normalizarDecimal(valor: string): string {
  const limpo = valor.replace(/[^\d,.-]/g, "").replace(",", ".");
  const negativo = limpo.startsWith("-") ? "-" : "";
  const semSinal = limpo.replace(/-/g, "");
  const [inteiro = "", ...decimais] = semSinal.split(".");
  return `${negativo}${inteiro}${decimais.length > 0 ? `.${decimais.join("").slice(0, 2)}` : ""}`;
}

function CampoMoeda({ label, value, onChange, error }: { label: string; value: string; onChange: (valor: string) => void; error?: string | undefined }) {
  const [focused, setFocused] = useState(false);
  return (
    <>
      <input
        aria-label={label}
        aria-invalid={Boolean(error)}
        className={cn(inputCls, "min-w-36", error && "border-destructive")}
        inputMode="decimal"
        placeholder="R$ 0,00"
        value={focused || value === "" ? value : formatarMoeda(value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(event) => onChange(normalizarDecimal(event.target.value))}
      />
      <MensagemErro>{error}</MensagemErro>
    </>
  );
}

function dataParaBrasil(valor: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(valor) ? valor.split("-").reverse().join("/") : "";
}

function dataParaIso(valor: string): string {
  const encontrado = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);
  if (!encontrado) return "";
  const [, dia, mes, ano] = encontrado;
  const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
  if (data.getFullYear() !== Number(ano) || data.getMonth() !== Number(mes) - 1 || data.getDate() !== Number(dia)) return "";
  return `${ano}-${mes}-${dia}`;
}

function CampoData({ label, value, onChange, error, hint }: { label: string; value: string; onChange: (valor: string) => void; error?: string | undefined; hint: string }) {
  const [focused, setFocused] = useState(false);
  const [texto, setTexto] = useState(dataParaBrasil(value));
  const pickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!focused) setTexto(dataParaBrasil(value));
  }, [focused, value]);

  const abrirCalendario = () => {
    const picker = pickerRef.current;
    if (!picker) return;
    try {
      picker.showPicker();
    } catch {
      picker.click();
    }
  };

  return (
    <>
      <div className="relative min-w-40">
        <input
          aria-label={label}
          aria-invalid={Boolean(error)}
          className={cn(inputCls, "pr-10", error && "border-destructive")}
          inputMode="numeric"
          placeholder="dd/mm/aaaa"
          maxLength={10}
          value={texto}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setTexto(dataParaBrasil(value));
          }}
          onChange={(event) => {
            const digitos = event.target.value.replace(/\D/g, "").slice(0, 8);
            const mascarado = digitos.replace(/^(\d{2})(\d)/, "$1/$2").replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
            setTexto(mascarado);
            onChange(dataParaIso(mascarado));
          }}
        />
        <input
          ref={pickerRef}
          type="date"
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-0 size-0 opacity-0"
          value={value}
          onChange={(event) => {
            setTexto(dataParaBrasil(event.target.value));
            onChange(event.target.value);
          }}
        />
        <button type="button" aria-label={`Abrir calendário: ${label}`} onClick={abrirCalendario} className="absolute right-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground">
          <ChevronDown className="size-4" />
        </button>
      </div>
      <p className="mt-1 text-[0.68rem] leading-4 text-muted-foreground">{hint}</p>
      <MensagemErro>{error}</MensagemErro>
    </>
  );
}

function CampoCalculado({ municipio, campo, label, onChange, onRestore }: {
  municipio: MunicipioNegociacao;
  campo: CampoManual;
  label: string;
  onChange: (campo: CampoManual, valor: string) => void;
  onRestore: (campo: CampoManual) => void;
}) {
  const [editing, setEditing] = useState(false);
  const editado = campo === "implementoCalculado" ? municipio.implementoEditadoManualmente : municipio.retroativoEditadoManualmente;
  const valor = municipio[campo] || "0.00";
  const meses = calcularMesesRetroativo(municipio.dataInicio, municipio.dataFim);
  const nome = `${label} — ${municipio.municipio}`;

  return (
    <div className="min-w-52">
      <div className="relative">
        <input
          aria-label={nome}
          className={cn(inputCls, "pr-10 font-semibold", !editing && "bg-muted")}
          type={editing ? "number" : "text"}
          step="0.01"
          readOnly={!editing}
          value={editing ? valor : formatarMoeda(valor)}
          onChange={(event) => onChange(campo, event.target.value)}
        />
        <button
          type="button"
          aria-label={editing ? `Concluir edição de ${nome}` : `Alterar ${nome}`}
          title={editing ? "Concluir edição" : "Alterar valor manualmente"}
          onClick={() => {
            if (!editing && !editado) onChange(campo, valor);
            setEditing((atual) => !atual);
          }}
          className="absolute right-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          {editing ? <Check className="size-4" /> : <Pencil className="size-4" />}
        </button>
      </div>
      {campo === "retroativoCalculado" && <p className="mt-1 text-[0.68rem] text-muted-foreground">Período considerado: {meses ?? 0} {meses === 1 ? "mês" : "meses"}</p>}
      {editado && <p className="mt-1 text-[0.68rem] font-medium text-brand">editado manualmente</p>}
      {editado && !editing && (
        <button type="button" onClick={() => onRestore(campo)} className="mt-1 flex items-center gap-1 text-[0.68rem] font-medium text-brand hover:underline">
          <RotateCcw className="size-3" /> restaurar cálculo automático
        </button>
      )}
    </div>
  );
}

function LabelMobile({ children }: { children: ReactNode }) {
  return <label className="mb-1.5 block text-xs font-semibold text-foreground">{children} <span className="text-brand">*</span></label>;
}

export default function MunicipiosNegociacao({ value, onChange, submitted, error }: {
  value: MunicipioNegociacao[];
  onChange: (municipios: MunicipioNegociacao[]) => void;
  submitted: boolean;
  error?: string | undefined;
}) {
  const [seletorAberto, setSeletorAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [duplicandoId, setDuplicandoId] = useState<string | null>(null);
  const [buscaDuplicacao, setBuscaDuplicacao] = useState("");
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const selecionados = useMemo(() => new Set(value.map((municipio) => municipio.municipio)), [value]);
  const totais = calcularTotaisMunicipios(value);
  const origemDuplicacao = value.find((municipio) => municipio.id === duplicandoId);
  const filtrados = PE_MUNICIPIOS.filter((municipio) => municipio.toLowerCase().includes(busca.trim().toLowerCase()));
  const disponiveisDuplicacao = PE_MUNICIPIOS.filter((municipio) => !selecionados.has(municipio) && municipio.toLowerCase().includes(buscaDuplicacao.trim().toLowerCase()));

  useEffect(() => {
    const fechar = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setSeletorAberto(false);
    };
    document.addEventListener("mousedown", fechar);
    return () => document.removeEventListener("mousedown", fechar);
  }, []);

  const expandir = (id: string) => setExpandidos((atuais) => new Set(atuais).add(id));
  const alternarMunicipio = (nome: string) => {
    const existente = value.find((municipio) => municipio.municipio === nome);
    if (existente) {
      onChange(value.filter((municipio) => municipio.id !== existente.id));
      return;
    }
    const novo = criarMunicipioNegociacao(nome);
    expandir(novo.id);
    onChange([...value, novo]);
  };
  const remover = (id: string) => onChange(value.filter((municipio) => municipio.id !== id));
  const atualizar = (id: string, campos: Partial<MunicipioNegociacao>) => {
    onChange(value.map((municipio) => municipio.id === id ? recalcularMunicipioNegociacao({ ...municipio, ...campos }) : municipio));
  };
  const alterarManual = (id: string, campo: CampoManual, valor: string) => {
    atualizar(id, {
      [campo]: valor,
      [campo === "implementoCalculado" ? "implementoEditadoManualmente" : "retroativoEditadoManualmente"]: true,
    });
  };
  const restaurar = (id: string, campo: CampoManual) => {
    const municipio = value.find((item) => item.id === id);
    if (!municipio) return;
    if (campo === "implementoCalculado") {
      atualizar(id, { implementoEditadoManualmente: false });
      return;
    }
    atualizar(id, {
      retroativoEditadoManualmente: false,
      retroativoCalculado: calcularAutomaticosMunicipio(municipio).retroativoCalculado,
    });
  };
  const duplicar = (novoMunicipio: string) => {
    if (!origemDuplicacao || selecionados.has(novoMunicipio)) return;
    const { id: _id, municipio: _municipio, ...valores } = origemDuplicacao;
    const copia = criarMunicipioNegociacao(novoMunicipio, valores);
    expandir(copia.id);
    onChange([...value, copia]);
    setDuplicandoId(null);
    setBuscaDuplicacao("");
  };

  const camposMobile = (municipio: MunicipioNegociacao) => (
    <div className="grid gap-4 border-t border-border pt-4">
      <div><LabelMobile>Preço do Ponto (R$)</LabelMobile><CampoMoeda label={`Preço do Ponto (R$) — ${municipio.municipio}`} value={municipio.precoPonto} error={erroVisivel(municipio, "precoPonto", submitted)} onChange={(valor) => atualizar(municipio.id, { precoPonto: valor })} /></div>
      <div><LabelMobile>Qtd Pontos Censo</LabelMobile><input aria-label={`Qtd Pontos Censo — ${municipio.municipio}`} className={inputCls} type="number" step="1" value={municipio.qtdPontosCenso} onChange={(event) => atualizar(municipio.id, { qtdPontosCenso: event.target.value })} /><MensagemErro>{erroVisivel(municipio, "qtdPontosCenso", submitted)}</MensagemErro></div>
      <div><LabelMobile>Qtd Pontos à Revelia</LabelMobile><input aria-label={`Qtd Pontos à Revelia — ${municipio.municipio}`} className={inputCls} type="number" step="1" value={municipio.qtdPontosRevelia} onChange={(event) => atualizar(municipio.id, { qtdPontosRevelia: event.target.value })} /><MensagemErro>{erroVisivel(municipio, "qtdPontosRevelia", submitted)}</MensagemErro></div>
      <div><LabelMobile>Data Início</LabelMobile><CampoData label={`Data Início — ${municipio.municipio}`} hint="Lançamento da rede" value={municipio.dataInicio} error={erroVisivel(municipio, "dataInicio", submitted)} onChange={(valor) => atualizar(municipio.id, { dataInicio: valor })} /></div>
      <div><LabelMobile>Data Fim</LabelMobile><CampoData label={`Data Fim — ${municipio.municipio}`} hint="Data final para cálculo do retroativo" value={municipio.dataFim} error={erroVisivel(municipio, "dataFim", submitted)} onChange={(valor) => atualizar(municipio.id, { dataFim: valor })} /></div>
      <div><label className="mb-1.5 block text-xs font-semibold">Implemento Calculado (R$)</label><CampoCalculado municipio={municipio} campo="implementoCalculado" label="Implemento Calculado (R$)" onChange={(campo, valor) => alterarManual(municipio.id, campo, valor)} onRestore={(campo) => restaurar(municipio.id, campo)} /></div>
      <div><label className="mb-1.5 block text-xs font-semibold">Retroativo Calculado (R$)</label><CampoCalculado municipio={municipio} campo="retroativoCalculado" label="Retroativo Calculado (R$)" onChange={(campo, valor) => alterarManual(municipio.id, campo, valor)} onRestore={(campo) => restaurar(municipio.id, campo)} /></div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setDuplicandoId(municipio.id)}><Copy className="size-3.5" />Duplicar</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => remover(municipio.id)}><Trash2 className="size-3.5" />Remover</Button>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="relative max-w-xl">
        <button type="button" aria-expanded={seletorAberto} onClick={() => { setSeletorAberto((aberto) => !aberto); setBusca(""); }} className={cn(inputCls, "flex min-h-11 items-center justify-between gap-3 text-left font-medium")}>
          <span className="flex items-center gap-2"><Plus className="size-4 text-brand" />Adicionar município</span>
          <span className="flex items-center gap-2 text-xs text-muted-foreground">{value.length > 0 && `${value.length} selecionado(s)`}<ChevronDown className={cn("size-4 transition-transform", seletorAberto && "rotate-180")} /></span>
        </button>
        {seletorAberto && (
          <div className="absolute z-40 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-panel">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2"><Search className="size-4 text-muted-foreground" /><input autoFocus aria-label="Buscar município para adicionar" placeholder="Buscar município..." value={busca} onChange={(event) => setBusca(event.target.value)} className="w-full bg-transparent text-sm outline-none" /></div>
            <ul className="max-h-64 overflow-y-auto py-1">
              {filtrados.length === 0 && <li className="px-3 py-3 text-xs text-muted-foreground">Nenhum município encontrado.</li>}
              {filtrados.map((nome) => {
                const ativo = selecionados.has(nome);
                return <li key={nome}><button type="button" role="checkbox" aria-checked={ativo} onClick={() => alternarMunicipio(nome)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium hover:bg-secondary/60"><span className={cn("flex size-4 shrink-0 items-center justify-center rounded border border-input", ativo && "border-primary bg-primary text-primary-foreground")}>{ativo && <Check className="size-3" />}</span>{nome}</button></li>;
              })}
            </ul>
          </div>
        )}
      </div>
      {submitted && error && <MensagemErro>{error}</MensagemErro>}

      <div className="hidden overflow-auto rounded-xl border border-border md:block">
        <table className="w-full min-w-395 text-left text-xs">
          <thead className="bg-secondary/50 text-[0.68rem] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="sticky left-0 z-20 min-w-44 bg-secondary px-3 py-3 font-semibold">Município</th>
              <th className="px-3 py-3 font-semibold">Preço do Ponto (R$) *</th>
              <th className="min-w-36 px-3 py-3 font-semibold">Qtd Pontos Censo *</th>
              <th className="min-w-40 px-3 py-3 font-semibold">Qtd Pontos à Revelia *</th>
              <th className="px-3 py-3 font-semibold">Data Início *</th>
              <th className="px-3 py-3 font-semibold">Data Fim *</th>
              <th className="px-3 py-3 font-semibold">Implemento Calculado (R$)</th>
              <th className="px-3 py-3 font-semibold">Retroativo Calculado (R$)</th>
              <th className="min-w-28 px-3 py-3 font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {value.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">Selecione ao menos um município para calcular implemento e retroativo</td></tr>
            ) : value.map((municipio) => (
              <tr key={municipio.id} className="border-t border-border align-top">
                <th scope="row" className="sticky left-0 z-10 bg-card px-3 py-4 font-semibold text-foreground">{municipio.municipio}</th>
                <td className="px-3 py-3"><CampoMoeda label={`Preço do Ponto (R$) — ${municipio.municipio}`} value={municipio.precoPonto} error={erroVisivel(municipio, "precoPonto", submitted)} onChange={(valor) => atualizar(municipio.id, { precoPonto: valor })} /></td>
                <td className="px-3 py-3"><input aria-label={`Qtd Pontos Censo — ${municipio.municipio}`} className={cn(inputCls, "min-w-32", erroVisivel(municipio, "qtdPontosCenso", submitted) && "border-destructive")} type="number" step="1" value={municipio.qtdPontosCenso} onChange={(event) => atualizar(municipio.id, { qtdPontosCenso: event.target.value })} /><MensagemErro>{erroVisivel(municipio, "qtdPontosCenso", submitted)}</MensagemErro></td>
                <td className="px-3 py-3"><input aria-label={`Qtd Pontos à Revelia — ${municipio.municipio}`} className={cn(inputCls, "min-w-32", erroVisivel(municipio, "qtdPontosRevelia", submitted) && "border-destructive")} type="number" step="1" value={municipio.qtdPontosRevelia} onChange={(event) => atualizar(municipio.id, { qtdPontosRevelia: event.target.value })} /><MensagemErro>{erroVisivel(municipio, "qtdPontosRevelia", submitted)}</MensagemErro></td>
                <td className="px-3 py-3"><CampoData label={`Data Início — ${municipio.municipio}`} hint="Lançamento da rede" value={municipio.dataInicio} error={erroVisivel(municipio, "dataInicio", submitted)} onChange={(valor) => atualizar(municipio.id, { dataInicio: valor })} /></td>
                <td className="px-3 py-3"><CampoData label={`Data Fim — ${municipio.municipio}`} hint="Data final para cálculo do retroativo" value={municipio.dataFim} error={erroVisivel(municipio, "dataFim", submitted)} onChange={(valor) => atualizar(municipio.id, { dataFim: valor })} /></td>
                <td className="px-3 py-3"><CampoCalculado municipio={municipio} campo="implementoCalculado" label="Implemento Calculado (R$)" onChange={(campo, valor) => alterarManual(municipio.id, campo, valor)} onRestore={(campo) => restaurar(municipio.id, campo)} /></td>
                <td className="px-3 py-3"><CampoCalculado municipio={municipio} campo="retroativoCalculado" label="Retroativo Calculado (R$)" onChange={(campo, valor) => alterarManual(municipio.id, campo, valor)} onRestore={(campo) => restaurar(municipio.id, campo)} /></td>
                <td className="px-3 py-3"><div className="flex gap-1"><button type="button" aria-label={`Duplicar ${municipio.municipio}`} title="Copiar valores para outro município" onClick={() => setDuplicandoId(municipio.id)} className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"><Copy className="size-4" /></button><button type="button" aria-label={`Remover ${municipio.municipio}`} title="Remover município" onClick={() => remover(municipio.id)} className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" /></button></div></td>
              </tr>
            ))}
          </tbody>
          {value.length > 0 && (
            <tfoot className="sticky bottom-0 z-20 border-t-2 border-brand/20 bg-secondary shadow-[0_-4px_12px_hsl(var(--foreground)/0.06)]">
              <tr className="font-semibold">
                <th className="sticky left-0 z-20 bg-secondary px-3 py-3">Total: {totais.quantidadeMunicipios} município(s)</th>
                <td className="px-3 py-3 text-muted-foreground">Totais</td>
                <td className="px-3 py-3">{inteiro.format(totais.qtdPontosCenso)}</td>
                <td className="px-3 py-3">{inteiro.format(totais.qtdPontosRevelia)}</td>
                <td colSpan={2} />
                <td className="px-3 py-3">{formatarMoeda(totais.implemento)}</td>
                <td className="px-3 py-3">{formatarMoeda(totais.retroativo)}</td>
                <td />
              </tr>
              <tr className="bg-primary text-primary-foreground">
                <td colSpan={7} className="px-3 py-3 text-right font-bold">TOTAL GERAL (Implemento + Retroativo)</td>
                <td colSpan={2} className="px-3 py-3 text-base font-bold">{formatarMoeda(totais.totalGeral)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {value.length === 0 ? <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">Selecione ao menos um município para calcular implemento e retroativo</p> : value.map((municipio) => {
          const aberto = expandidos.has(municipio.id);
          return (
            <article key={municipio.id} className="overflow-hidden rounded-xl border border-border bg-card">
              <button type="button" aria-expanded={aberto} onClick={() => setExpandidos((atuais) => { const proximos = new Set(atuais); if (proximos.has(municipio.id)) proximos.delete(municipio.id); else proximos.add(municipio.id); return proximos; })} className="flex w-full items-center gap-3 p-4 text-left">
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{municipio.municipio}</span><span className="mt-0.5 block text-xs text-muted-foreground">Total: {formatarMoeda((Number(municipio.implementoCalculado) || 0) + (Number(municipio.retroativoCalculado) || 0))}</span></span>
                <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", aberto && "rotate-180")} />
              </button>
              {aberto && <div className="px-4 pb-4">{camposMobile(municipio)}</div>}
            </article>
          );
        })}
        {value.length > 0 && (
          <div className="sticky bottom-3 z-20 rounded-xl border border-brand/20 bg-card p-4 shadow-panel">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><p className="text-muted-foreground">Municípios</p><p className="font-semibold">{totais.quantidadeMunicipios}</p></div>
              <div><p className="text-muted-foreground">Pontos Censo</p><p className="font-semibold">{inteiro.format(totais.qtdPontosCenso)}</p></div>
              <div><p className="text-muted-foreground">Pontos à Revelia</p><p className="font-semibold">{inteiro.format(totais.qtdPontosRevelia)}</p></div>
              <div><p className="text-muted-foreground">Implemento</p><p className="font-semibold">{formatarMoeda(totais.implemento)}</p></div>
              <div><p className="text-muted-foreground">Retroativo</p><p className="font-semibold">{formatarMoeda(totais.retroativo)}</p></div>
              <div className="col-span-2 mt-1 flex items-center justify-between border-t border-border pt-3"><span className="font-bold text-primary">TOTAL GERAL</span><span className="text-lg font-bold text-primary">{formatarMoeda(totais.totalGeral)}</span></div>
            </div>
          </div>
        )}
      </div>

      {origemDuplicacao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDuplicandoId(null); }}>
          <div role="dialog" aria-modal="true" aria-label="Duplicar município" className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-panel">
            <header className="flex items-start gap-3 border-b border-border p-5"><div className="flex-1"><h3 className="font-semibold text-primary">Duplicar município</h3><p className="mt-1 text-xs text-muted-foreground">Escolha o município que receberá os valores de {origemDuplicacao.municipio}.</p></div><button type="button" aria-label="Fechar duplicação" onClick={() => setDuplicandoId(null)} className="rounded-lg p-1 text-muted-foreground hover:bg-secondary"><X className="size-4" /></button></header>
            <div className="p-4"><div className="flex items-center gap-2 rounded-xl border border-input px-3 py-2"><Search className="size-4 text-muted-foreground" /><input autoFocus aria-label="Buscar município para duplicar" placeholder="Buscar município..." value={buscaDuplicacao} onChange={(event) => setBuscaDuplicacao(event.target.value)} className="w-full bg-transparent text-sm outline-none" /></div></div>
            <ul className="max-h-72 overflow-y-auto px-2 pb-3">
              {disponiveisDuplicacao.length === 0 && <li className="px-3 py-6 text-center text-xs text-muted-foreground">Nenhum município disponível.</li>}
              {disponiveisDuplicacao.map((nome) => <li key={nome}><button type="button" onClick={() => duplicar(nome)} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary">{nome}</button></li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
