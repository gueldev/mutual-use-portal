import { describe, test } from "node:test";
import { deepStrictEqual, strictEqual } from "node:assert";
import { calcularMesesRetroativo, calcularValoresNegociacao, emptyDadosCliente } from "./carteira-negociacao";

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
});