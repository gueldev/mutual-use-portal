import { describe, expect, test } from "bun:test";
import { calcularMesesRetroativo, calcularValoresNegociacao, emptyDadosCliente } from "./carteira-negociacao";

describe("cálculos da Seção 2", () => {
  test("implemento multiplica pontos pelo preço", () => {
    expect(calcularValoresNegociacao({ ...emptyDadosCliente, qtdPontosRevelia: "10", precoPonto: "20" }).implementoCalculado).toBe("200.00");
  });
  test("exemplo de janeiro a maio considera cinco meses no retroativo", () => {
    const dados = { ...emptyDadosCliente, qtdPontosRevelia: "10", precoPonto: "20", dataInicio: "2026-01-01", dataFim: "2026-05-10" };
    expect(calcularMesesRetroativo(dados.dataInicio, dados.dataFim)).toBe(5);
    expect(calcularValoresNegociacao(dados).retroativoCalculado).toBe("1000.00");
  });
  test("cinco dias restantes completam um mês adicional, quatro não", () => {
    expect(calcularMesesRetroativo("2026-01-01", "2026-05-06")).toBe(5);
    expect(calcularMesesRetroativo("2026-01-01", "2026-05-05")).toBe(4);
  });
  test("acumulado exclui o mês do implemento e conta até dezembro", () => {
    const dados = { ...emptyDadosCliente, qtdPontosRevelia: "10", precoPonto: "20", mesImplemento: "2026-10" };
    expect(calcularValoresNegociacao(dados).implementoAcumulado).toBe("400.00");
    expect(calcularValoresNegociacao({ ...dados, mesImplemento: "2026-12" }).implementoAcumulado).toBe("0.00");
  });
  test("campos vazios não geram valores e períodos invertidos não geram retroativo", () => {
    expect(calcularValoresNegociacao(emptyDadosCliente)).toEqual({ implementoCalculado: "", retroativoCalculado: "", implementoAcumulado: "" });
    expect(calcularMesesRetroativo("2026-05-10", "2026-01-01")).toBeNull();
  });
});