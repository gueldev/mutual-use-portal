import { isValidCNPJ } from "@/lib/cnpj";

/** Seção 1 — Dados do Cliente. Novas seções serão adicionadas a este modelo. */
export type DadosCliente = {
  documento: string; // CNPJ/CPF somente dígitos
  cc: string;
  nomeParceiro: string;
  razaoSocial: string;
  nomeFantasia: string;
};

export const emptyDadosCliente: DadosCliente = {
  documento: "",
  cc: "",
  nomeParceiro: "",
  razaoSocial: "",
  nomeFantasia: "",
};

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
  if (!v.cc.trim()) e.cc = "Informe o CC.";
  else if (!/^\d+$/.test(v.cc)) e.cc = "O CC deve conter somente números.";
  if (!v.nomeParceiro.trim()) e.nomeParceiro = "Informe o nome do parceiro.";
  if (!v.razaoSocial.trim()) e.razaoSocial = "Informe a razão social.";
  if (!v.nomeFantasia.trim()) e.nomeFantasia = "Informe o nome fantasia.";
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
