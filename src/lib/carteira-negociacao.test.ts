import { describe, test } from "node:test";
import { deepStrictEqual, strictEqual } from "node:assert";
import {
  calcularAutomaticosMunicipio,
  calcularMesesRetroativo,
  calcularTotaisMunicipios,
  calcularValoresNegociacao,
  criarMunicipioNegociacao,
  emptyDadosCliente,
  migrarMunicipiosLegados,
  recalcularMunicipioNegociacao,
  validarDadosCliente,
} from "./carteira-negociacao";

describe("cálculos da Seção 2", () => {
  test("implemento multiplica pontos pelo preço", () => {
    strictEqual(calcularValoresNegociacao({ ...emptyDadosCliente, qtdPontosRevelia: "10", precoPonto: "20" }).implementoCalculado, "200.00");
  });
  test("exemplo de janeiro a maio considera cinco meses no retroativo", () => {
    const dados = { ...emptyDadosCliente, qtdPontosRevelia: "10", precoPonto: "20", dataInicio: "2026-01-01", dataFim: "2026-05-10" };
    strictEqual(calcularMesesRetroativo(dados.dataInicio, dados.dataFim), 5);
    strictEqual(calcularValoresNegociacao(dados).retroativoCalculado, "1000.00");
  });
  test("cinco dias restantes completam um mês adicional, quatro não", () => {
    strictEqual(calcularMesesRetroativo("2026-01-01", "2026-05-06"), 5);
    strictEqual(calcularMesesRetroativo("2026-01-01", "2026-05-05"), 4);
  });
  test("acumulado exclui o mês do implemento e conta até dezembro", () => {
    const dados = { ...emptyDadosCliente, qtdPontosRevelia: "10", precoPonto: "20", mesImplemento: "2026-10" };
    strictEqual(calcularValoresNegociacao(dados).implementoAcumulado, "400.00");
    strictEqual(calcularValoresNegociacao({ ...dados, mesImplemento: "2026-12" }).implementoAcumulado, "0.00");
  });
  test("campos vazios não geram valores e períodos invertidos não geram retroativo", () => {
    deepStrictEqual(calcularValoresNegociacao(emptyDadosCliente), { implementoCalculado: "", retroativoCalculado: "", implementoAcumulado: "" });
    strictEqual(calcularMesesRetroativo("2026-05-10", "2026-01-01"), null);
  });
  test("nome fantasia pode ficar vazio quando os demais campos obrigatórios estão preenchidos", () => {
    const dados = {
      ...emptyDadosCliente,
      documento: "52998224725",
      cc: "1234567890",
      nomeParceiro: "Parceiro",
      razaoSocial: "Razão Social",
      nomeFantasia: "",
      plaqueta: "12345",
    };
    strictEqual(validarDadosCliente(dados).nomeFantasia, undefined);
  });
  test("a tabela exige ao menos um município e todos os campos obrigatórios da linha", () => {
    strictEqual(validarDadosCliente(emptyDadosCliente).municipios, "Selecione ao menos um município para calcular implemento e retroativo.");
    const incompleto = criarMunicipioNegociacao("Recife");
    strictEqual(validarDadosCliente({ ...emptyDadosCliente, municipios: [incompleto] }).municipios, "Preencha todos os campos obrigatórios dos municípios e corrija as datas informadas.");
  });
  test("município de prestação preenchido deve pertencer à lista de Pernambuco", () => {
    strictEqual(validarDadosCliente({ ...emptyDadosCliente, municipioLocalPrestacao: "Recife" }).municipioLocalPrestacao, undefined);
    strictEqual(validarDadosCliente({ ...emptyDadosCliente, municipioLocalPrestacao: "Município inexistente" }).municipioLocalPrestacao, "Selecione um município de Pernambuco da lista.");
  });
  test("município da Seção 3 é obrigatório", () => {
    strictEqual(validarDadosCliente(emptyDadosCliente).municipioLocalPrestacao, "Informe o município/local de prestação.");
    strictEqual(validarDadosCliente({ ...emptyDadosCliente, municipioLocalPrestacao: "Recife" }).municipioLocalPrestacao, undefined);
  });
  test("setor da Seção 3 é obrigatório", () => {
    strictEqual(validarDadosCliente(emptyDadosCliente).setor, "Selecione o setor.");
    strictEqual(validarDadosCliente({ ...emptyDadosCliente, setor: "Norte" }).setor, undefined);
  });
  test("status do projeto da Seção 3 é obrigatório", () => {
    strictEqual(validarDadosCliente(emptyDadosCliente).statusProjeto, "Selecione o status do projeto.");
    strictEqual(validarDadosCliente({ ...emptyDadosCliente, statusProjeto: "Aguardando" }).statusProjeto, undefined);
  });
});

describe("municípios da Seção 2", () => {
  const dadosRecife = {
    precoPonto: "20",
    qtdPontosCenso: "8",
    qtdPontosRevelia: "10",
    dataInicio: "2026-01-01",
    dataFim: "2026-05-10",
  };

  test("01/01/2000 a 10/10/2010 corresponde a 130 meses", () => {
    strictEqual(calcularMesesRetroativo("2000-01-01", "2010-10-10"), 130);
  });

  test("cada município calcula implemento e retroativo com seus próprios valores", () => {
    const recife = criarMunicipioNegociacao("Recife", dadosRecife);
    strictEqual(recife.implementoCalculado, "200.00");
    strictEqual(recife.retroativoCalculado, "1000.00");
  });

  test("dados ausentes produzem zero e data final anterior não calcula retroativo", () => {
    const vazio = criarMunicipioNegociacao("Recife");
    strictEqual(vazio.implementoCalculado, "0.00");
    strictEqual(vazio.retroativoCalculado, "0.00");
    const invertido = criarMunicipioNegociacao("Recife", { ...dadosRecife, dataFim: "2025-12-31" });
    strictEqual(invertido.retroativoCalculado, "0.00");
  });

  test("implemento sobrescrito congela o retroativo automático até ser restaurado", () => {
    let recife = criarMunicipioNegociacao("Recife", dadosRecife);
    recife = recalcularMunicipioNegociacao({ ...recife, implementoCalculado: "350.00", implementoEditadoManualmente: true });
    recife = recalcularMunicipioNegociacao({ ...recife, precoPonto: "30" });
    strictEqual(recife.implementoCalculado, "350.00");
    strictEqual(recife.retroativoCalculado, "1000.00");
    recife = recalcularMunicipioNegociacao({ ...recife, implementoEditadoManualmente: false });
    strictEqual(recife.implementoCalculado, "300.00");
    strictEqual(recife.retroativoCalculado, "1500.00");
  });

  test("totais somam pontos e valores, incluindo ajustes manuais", () => {
    const recife = criarMunicipioNegociacao("Recife", dadosRecife);
    const olinda = criarMunicipioNegociacao("Olinda", { ...dadosRecife, qtdPontosCenso: "2", qtdPontosRevelia: "5" });
    const totais = calcularTotaisMunicipios([recife, olinda]);
    strictEqual(totais.quantidadeMunicipios, 2);
    strictEqual(totais.qtdPontosCenso, 10);
    strictEqual(totais.qtdPontosRevelia, 15);
    strictEqual(totais.implemento, 300);
    strictEqual(totais.retroativo, 1500);
    strictEqual(totais.totalGeral, 1800);
  });

  test("registro antigo migra como um único município Não informado", () => {
    const antigo = { ...emptyDadosCliente, ...dadosRecife, implementoCalculado: "350.00", retroativoCalculado: "1000.00" };
    const municipios = migrarMunicipiosLegados(antigo);
    strictEqual(municipios.length, 1);
    strictEqual(municipios[0].municipio, "Não informado");
    strictEqual(municipios[0].implementoCalculado, "350.00");
    strictEqual(municipios[0].implementoEditadoManualmente, true);
    strictEqual(municipios[0].retroativoEditadoManualmente, false);
  });
});