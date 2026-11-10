import { isValidCNPJ } from "@/lib/cnpj";
import { PE_MUNICIPIOS } from "@/lib/pe-municipios";
import { addMonths, differenceInCalendarDays, differenceInMonths, isValid, parseISO } from "date-fns";

/** Dados da carteira: cliente e contrato. Novas seções serão adicionadas a este modelo. */
export type DadosCliente = {
  numeroNotificacao: string;
  dataNotificacao: string;
  documento: string; // CNPJ/CPF somente dígitos
  cc: string;
  nomeParceiro: string;
  razaoSocial: string;
  nomeFantasia: string;
  plaqueta: string;
  numeroContrato: string;
  inicioVigencia: string;
  precoPonto: string;
  qtdPontosCenso: string;
  qtdPontosRevelia: string;
  dataInicio: string;
  dataFim: string;
  implementoCalculado: string;
  retroativoCalculado: string;
  focal: string;
  implementoAcumulado: string;
  mesImplemento: string;
  condicaoPagamento: string;
  qtdParcelas: string;
  excecaoMatriz: string;
  desconto: string;
  percentualDesconto: string;
  multa: string;
  percentualMulta: string;
  valorMulta: string;
  retroativoNegociado: string;
  contasReceberNegociado: string;
  observacoes: string;
  municipioLocalPrestacao: string;
  setor: string;
  statusProjeto: string;
  origemRetroativo: string;
  dataConclusaoNegociacao: string;
};

export const emptyDadosCliente: DadosCliente = {
  numeroNotificacao: "",
  dataNotificacao: "",
  documento: "",
  cc: "",
  nomeParceiro: "",
  razaoSocial: "",
  nomeFantasia: "",
  plaqueta: "",
  numeroContrato: "",
  inicioVigencia: "",
  precoPonto: "",
  qtdPontosCenso: "",
  qtdPontosRevelia: "",
  dataInicio: "",
  dataFim: "",
  implementoCalculado: "",
  retroativoCalculado: "",
  focal: "",
  implementoAcumulado: "",
  mesImplemento: "",
  condicaoPagamento: "",
  qtdParcelas: "",
  excecaoMatriz: "",
  desconto: "",
  percentualDesconto: "",
  multa: "",
  percentualMulta: "",
  valorMulta: "",
  retroativoNegociado: "",
  contasReceberNegociado: "",
  observacoes: "",
  municipioLocalPrestacao: "",
  setor: "",
  statusProjeto: "",
  origemRetroativo: "",
  dataConclusaoNegociacao: "",
};

/** Meses completos, acrescidos de um mês quando o restante atingir cinco dias. */
export function calcularMesesRetroativo(dataInicio: string, dataFim: string): number | null {
  if (!dataInicio || !dataFim) return null;
  const inicio = parseISO(dataInicio);
  const fim = parseISO(dataFim);
  if (!isValid(inicio) || !isValid(fim) || fim < inicio) return null;
  const meses = differenceInMonths(fim, inicio);
  const diasRestantes = differenceInCalendarDays(fim, addMonths(inicio, meses));
  return meses + (diasRestantes >= 5 ? 1 : 0);
}

export function calcularValoresNegociacao(dados: DadosCliente): Pick<DadosCliente, "implementoCalculado" | "retroativoCalculado" | "implementoAcumulado"> {
  const preco = Number(dados.precoPonto);
  const pontos = Number(dados.qtdPontosRevelia);
  const valores = { implementoCalculado: "", retroativoCalculado: "", implementoAcumulado: "" };
  if (!dados.precoPonto.trim() || !dados.qtdPontosRevelia.trim() || !Number.isFinite(preco) || !Number.isFinite(pontos)) return valores;
  const implemento = pontos * preco;
  valores.implementoCalculado = implemento.toFixed(2);
  const meses = calcularMesesRetroativo(dados.dataInicio, dados.dataFim);
  if (meses !== null) valores.retroativoCalculado = (implemento * meses).toFixed(2);
  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(dados.mesImplemento)) {
    const mesesRestantes = 12 - Number(dados.mesImplemento.slice(5));
    valores.implementoAcumulado = (implemento * mesesRestantes).toFixed(2);
  }
  return valores;
}

export function maskCpfCnpj(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 11) {
    return d
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
  }
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export function isValidCPF(value: string): boolean {
  const d = value.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const dv = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return dv(9) === Number(d[9]) && dv(10) === Number(d[10]);
}

export function validarDadosCliente(v: DadosCliente): Partial<Record<keyof DadosCliente, string>> {
  const e: Partial<Record<keyof DadosCliente, string>> = {};
  const d = v.documento.replace(/\D/g, "");
  if (!d) e.documento = "Informe o CNPJ ou CPF.";
  else if (d.length === 11 ? !isValidCPF(d) : d.length === 14 ? !isValidCNPJ(d) : true)
    e.documento = "CNPJ/CPF inválido.";
  if (!v.cc.trim()) e.cc = "Informe a Conta Contrato.";
  else if (!/^\d{10}$/.test(v.cc)) e.cc = "A Conta Contrato deve ter exatamente 10 dígitos.";
  if (!v.nomeParceiro.trim()) e.nomeParceiro = "Informe o nome do parceiro.";
  if (!v.razaoSocial.trim()) e.razaoSocial = "Informe a razão social.";
  if (!v.plaqueta.trim()) e.plaqueta = "Informe a plaqueta.";
  if (!v.municipioLocalPrestacao.trim()) e.municipioLocalPrestacao = "Informe o município/local de prestação.";
  else if (!PE_MUNICIPIOS.some((m) => m.toLowerCase() === v.municipioLocalPrestacao.trim().toLowerCase()))
    e.municipioLocalPrestacao = "Selecione um município de Pernambuco da lista.";
  if (!v.setor.trim()) e.setor = "Selecione o setor.";
  if (!v.statusProjeto.trim()) e.statusProjeto = "Selecione o status do projeto.";
  return e;
}

/**
 * Ponto de integração futura: consulta de cliente por CC ou CNPJ/CPF.
 * Hoje não há base disponível, então sempre retorna null (preenchimento manual).
 */
export async function buscarCliente(
  _chave: { cc?: string; documento?: string },
): Promise<Partial<DadosCliente> | null> {
  return null;
}
