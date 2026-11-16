# Carteira de Negociação — Seção 2

- [x] Criar Base da carteira com busca, edição e salvamento dos campos existentes, sem Status da Negociação, Qtde Postes Reconhecidos, Mês Carteira, Ano e Prazo para apresentação.

- [x] Adicionar Implemento Calculado, Retroativo Calculado, Focal, Implemento Acumulado e Mês do Implemento, mantendo os demais campos.
- [x] Calcular o retroativo como pontos à revelia × preço × meses completos entre Data Início e Data Fim; acrescentar um mês quando o restante for de pelo menos cinco dias. O período 01/01/2026 a 10/05/2026 corresponde a cinco meses.
- [x] Confirmar a operação do Implemento Calculado e a inclusão do Mês do Implemento na contagem até dezembro: multiplicação e somente meses seguintes.
- [x] Testar os cálculos e conferir o preenchimento e a limpeza na página.

- [x] Acrescentar condições de pagamento, quantidade de parcelas, exceção à matriz, desconto, multa e valores negociados à Seção 2.
- [x] Conferir preenchimento, troca da condição de pagamento e limpeza dos novos campos sem alterar cálculos anteriores.
- [x] Mostrar parcelas apenas em Parcelado, percentual de desconto apenas com Desconto Sim e percentual/valor da multa apenas com Multa Sim.
- [x] Adicionar a Seção 3 com observações, município/local, setor, status, origem do retroativo e data de conclusão; conferir preenchimento e limpeza.
- [x] Usar a mesma lista de analistas no Focal e em Analisado por, incluindo ANNESHERLLY ALCELITA FERREIRA DE ARAUJO.
- [x] Aplicar o seletor restrito aos municípios de Pernambuco no Município/Local de prestação e iniciar as opções de Setor com letras maiúsculas.
- [x] Permitir ajuste manual independente dos três valores calculados, preservando o cálculo automático e a opção de restaurá-lo; conferir na página.

- [x] Substituir os campos únicos de município da Seção 2 por linhas com seleção múltipla, duplicação, cálculos e ajustes manuais, mantendo Focal fora da tabela.
- [x] Adicionar totais em tempo real, layout de tabela no desktop e cards expansíveis no mobile.
- [x] Salvar municípios, ajustes e totais na Base da carteira, migrando registros antigos como “Não informado”.
- [x] Testar cálculos, validações, persistência, edição e limpeza sem alterar as demais seções.

- [x] Remover Município/Local de prestação e Setor da Seção 3, mantendo os demais campos.
- [x] Salvar uma linha na Base da carteira para cada município selecionado, repetindo os demais dados e preservando os valores daquele município.
- [x] Exibir o município na Base da carteira e permitir editar cada linha independentemente.
- [x] Testar remoção dos campos, separação dos registros, edição e limpeza do formulário.

- [x] Mover Condição de Pagamento, Exceção a Matriz, Desconto, Multa, Retroativo Negociado e Contas à receber Negociado para a Seção 3, com seus campos condicionais, mantendo Mês do Implemento na Seção 2 e preservando toda a lógica.
- [x] Conferir preenchimento, campos condicionais, salvamento por município e limpeza após a reorganização.
- [x] Adicionar exclusão individual por lixeira vermelha ao lado de Editar na Base da carteira e testar a persistência.