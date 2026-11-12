import { isValidCNPJ } from "@/lib/cnpj";
import { PE_MUNICIPIOS } from "@/lib/pe-municipios";
import { addMonths, differenceInCalendarDays, differenceInMonths, isValid, parseISO } from "date-fns";

export type MunicipioNegociacao = {
  id: string;
  municipio: string;
  precoPonto: string;
  qtdPontosCenso: string;
  qtdPontosRevelia: string;
  dataInicio: string;
  dataFim: string;
  implementoCalculado: string;
  retroativoCalculado: string;
  implementoEditadoManualmente: boolean;
  retroativoEditadoManualmente: boolean;
};

export type TotaisMunicipios = {
  quantidadeMunicipios: number;
  qtdPontosCenso: number;
  qtdPontosRevelia: number;
  implemento: number;
  retroativo: number;
  totalGeral: number;
};

/** Dados da carteira: cliente, contrato, municípios e negociação. */
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
  /** Campos únicos mantidos para ler registros anteriores à tabela de municípios. */
  precoPonto: string;
  qtdPontosCenso: string;
  qtdPontosRevelia: string;
  dataInicio: string;
  dataFim: string;
  implementoCalculado: string;
  retroativoCalculado: string;
  municipios: MunicipioNegociacao[];
  totaisMunicipios: TotaisMunicipios;
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

export const emptyTotaisMunicipios: TotaisMunicipios = {
  quantidadeMunicipios: 0,
  qtdPontosCenso: 0,
  qtdPontosRevelia: 0,
  implemento: 0,
  retroativo: 0,
  totalGeral: 0,
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
  municipios: [],
  totaisMunicipios: emptyTotaisMunicipios,
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

function novoIdMunicipio(): string {
  return globalThis.crypto?.randomUUID?.() ?? `municipio-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function criarMunicipioNegociacao(
  municipio: string,
  valores: Partial<MunicipioNegociacao> = {},
): MunicipioNegociacao {
  return recalcularMunicipioNegociacao({
    id: novoIdMunicipio(),
    municipio,
    precoPonto: "",
    qtdPontosCenso: "",
    qtdPontosRevelia: "",
    dataInicio: "",
    dataFim: "",
    implementoCalculado: "0.00",
    retroativoCalculado: "0.00",
    implementoEditadoManualmente: false,
    retroativoEditadoManualmente: false,
    ...valores,
  });
}

export function calcularAutomaticosMunicipio(
  dados: Pick<MunicipioNegociacao, "precoPonto" | "qtdPontosRevelia" | "dataInicio" | "dataFim">,
): { implementoCalculado: string; retroativoCalculado: string } {
  const preco = Number(dados.precoPonto);
  const pontos = Number(dados.qtdPontosRevelia);
  const possuiBase = dados.precoPonto.trim() !== "" && dados.qtdPontosRevelia.trim() !== "" && Number.isFinite(preco) && Number.isFinite(pontos);
  const implemento = possuiBase ? pontos * preco : 0;
  const meses = calcularMesesRetroativo(dados.dataInicio, dados.dataFim);
  return {
    implementoCalculado: implemento.toFixed(2),
    retroativoCalculado: meses === null ? "0.00" : (implemento * meses).toFixed(2),
  };
}

/** Recalcula somente os valores que não estão congelados por um ajuste manual. */
export function recalcularMunicipioNegociacao(municipio: MunicipioNegociacao): MunicipioNegociacao {
  const automaticos = calcularAutomaticosMunicipio(municipio);
  return {
    ...municipio,
    implementoCalculado: municipio.implementoEditadoManualmente ? municipio.implementoCalculado : automaticos.implementoCalculado,
    retroativoCalculado: municipio.retroativoEditadoManualmente || municipio.implementoEditadoManualmente
      ? municipio.retroativoCalculado
      : automaticos.retroativoCalculado,
  };
}

export function calcularTotaisMunicipios(municipios: MunicipioNegociacao[]): TotaisMunicipios {
  const numero = (valor: string) => {
    const convertido = Number(valor);
    return valor.trim() !== "" && Number.isFinite(convertido) ? convertido : 0;
  };
  const totais = municipios.reduce((acumulado, municipio) => ({
    quantidadeMunicipios: acumulado.quantidadeMunicipios + 1,
    qtdPontosCenso: acumulado.qtdPontosCenso + numero(municipio.qtdPontosCenso),
    qtdPontosRevelia: acumulado.qtdPontosRevelia + numero(municipio.qtdPontosRevelia),
    implemento: acumulado.implemento + numero(municipio.implementoCalculado),
    retroativo: acumulado.retroativo + numero(municipio.retroativoCalculado),
    totalGeral: 0,
  }), { ...emptyTotaisMunicipios });
  return { ...totais, totalGeral: totais.implemento + totais.retroativo };
}

export function calcularValoresNegociacao(dados: DadosCliente): Pick<DadosCliente, "implementoCalculado" | "retroativoCalculado" | "implementoAcumulado"> {
  const valores = { implementoCalculado: "", retroativoCalculado: "", implementoAcumulado: "" };
  const mesValido = /^\d{4}-(0[1-9]|1[0-2])$/.test(dados.mesImplemento);
  const mesesRestantes = mesValido ? 12 - Number(dados.mesImplemento.slice(5)) : null;

  if (dados.municipios.length > 0) {
    const totais = calcularTotaisMunicipios(dados.municipios);
    valores.implementoCalculado = totais.implemento.toFixed(2);
    valores.retroativoCalculado = totais.retroativo.toFixed(2);
    if (mesesRestantes !== null) valores.implementoAcumulado = (totais.implemento * mesesRestantes).toFixed(2);
    return valores;
  }

  const preco = Number(dados.precoPonto);
  const pontos = Number(dados.qtdPontosRevelia);
  if (!dados.precoPonto.trim() || !dados.qtdPontosRevelia.trim() || !Number.isFinite(preco) || !Number.isFinite(pontos)) return valores;
  const implemento = pontos * preco;
  valores.implementoCalculado = implemento.toFixed(2);
  const meses = calcularMesesRetroativo(dados.dataInicio, dados.dataFim);
  if (meses !== null) valores.retroativoCalculado = (implemento * meses).toFixed(2);
  if (mesesRestantes !== null) valores.implementoAcumulado = (implemento * mesesRestantes).toFixed(2);
  return valores;
}

/** Converte o antigo conjunto único da Seção 2 em um município denominado “Não informado”. */
export function migrarMunicipiosLegados(dados: DadosCliente): MunicipioNegociacao[] {
  const municipio = criarMunicipioNegociacao("Não informado", {
    precoPonto: dados.precoPonto,
    qtdPontosCenso: dados.qtdPontosCenso,
    qtdPontosRevelia: dados.qtdPontosRevelia,
    dataInicio: dados.dataInicio,
    dataFim: dados.dataFim,
  });
  const automaticos = calcularAutomaticosMunicipio(municipio);
  const foiEditado = (salvo: string, automatico: string) => salvo.trim() !== "" && Number(salvo) !== Number(automatico);
  return [{
    ...municipio,
    implementoCalculado: dados.implementoCalculado || automaticos.implementoCalculado,
    retroativoCalculado: dados.retroativoCalculado || automaticos.retroativoCalculado,
    implementoEditadoManualmente: foiEditado(dados.implementoCalculado, automaticos.implementoCalculado),
    retroativoEditadoManualmente: foiEditado(dados.retroativoCalculado, automaticos.retroativoCalculado),
  }];
}

export function normalizarDadosCliente(dados: Partial<DadosCliente>): DadosCliente {
  const completo = { ...emptyDadosCliente, ...dados };
  const municipios = Array.isArray(dados.municipios)
    ? dados.municipios.map((municipio) => criarMunicipioNegociacao(municipio.municipio || "Não informado", { ...municipio, id: municipio.id || novoIdMunicipio() }))
    : migrarMunicipiosLegados(completo);
  const totaisMunicipios = calcularTotaisMunicipios(municipios);
  return {
    ...completo,
    municipios,
    totaisMunicipios,
    implementoCalculado: municipios.length > 0 ? totaisMunicipios.implemento.toFixed(2) : completo.implementoCalculado,
    retroativoCalculado: municipios.length > 0 ? totaisMunicipios.retroativo.toFixed(2) : completo.retroativoCalculado,
  };
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

export type ErrosMunicipio = Partial<Record<"municipio" | "precoPonto" | "qtdPontosCenso" | "qtdPontosRevelia" | "dataInicio" | "dataFim", string>>;

export function validarMunicipioNegociacao(municipio: MunicipioNegociacao): ErrosMunicipio {
  const erros: ErrosMunicipio = {};
  if (!municipio.municipio.trim()) erros.municipio = "Selecione o município.";
  if (!municipio.precoPonto.trim()) erros.precoPonto = "Informe o preço do ponto.";
  if (!municipio.qtdPontosCenso.trim()) erros.qtdPontosCenso = "Informe a quantidade de pontos do censo.";
  if (!municipio.qtdPontosRevelia.trim()) erros.qtdPontosRevelia = "Informe a quantidade de pontos à revelia.";
  if (!municipio.dataInicio) erros.dataInicio = "Informe a data de início.";
  if (!municipio.dataFim) erros.dataFim = "Informe a data fim.";
  if (municipio.dataInicio && municipio.dataFim && calcularMesesRetroativo(municipio.dataInicio, municipio.dataFim) === null) {
    erros.dataFim = "A Data Fim deve ser igual ou posterior à Data Início.";
  }
  return erros;
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
  if (v.municipios.length === 0) e.municipios = "Selecione ao menos um município para calcular implemento e retroativo.";
  else if (v.municipios.some((municipio) => Object.keys(validarMunicipioNegociacao(municipio)).length > 0)) {
    e.municipios = "Preencha todos os campos obrigatórios dos municípios e corrija as datas informadas.";
  } else if (new Set(v.municipios.map((municipio) => municipio.municipio.toLowerCase())).size !== v.municipios.length) {
    e.municipios = "Não é permitido selecionar o mesmo município mais de uma vez.";
  }
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
