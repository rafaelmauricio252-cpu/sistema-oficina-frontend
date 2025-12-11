import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ============================================
// UTILITÁRIO DE GERAÇÃO DE PDFs
// ============================================

interface ColunaTabela {
  header: string;
  dataKey: string;
}

interface DadosRelatorio {
  dados: any[];
  totalizadores?: any;
}

/**
 * Formata valor monetário para exibição
 */
function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

/**
 * Formata data para exibição (formato brasileiro: dd/mm/yyyy)
 */
function formatarData(data: any): string {
  if (!data) return '-';

  // Converter para string se necessário
  let dataStr = data;
  if (typeof data !== 'string') {
    if (data instanceof Date) {
      dataStr = data.toISOString();
    } else {
      dataStr = String(data);
    }
  }

  // Se já está no formato DD/MM/YYYY, retornar como está
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataStr)) {
    return dataStr;
  }

  // Parse manual da data ISO (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss)
  const dataLimpa = dataStr.split('T')[0]; // Pega apenas a parte da data
  const partes = dataLimpa.split('-');

  if (partes.length === 3 && partes[0].length === 4) {
    // Formato ISO: YYYY-MM-DD
    const ano = partes[0];
    const mes = partes[1].padStart(2, '0');
    const dia = partes[2].padStart(2, '0');
    return `${dia}/${mes}/${ano}`;
  }

  // Fallback: tentar converter com Date object
  try {
    const date = new Date(dataStr);
    if (!isNaN(date.getTime())) {
      const dia = String(date.getUTCDate()).padStart(2, '0');
      const mes = String(date.getUTCMonth() + 1).padStart(2, '0');
      const ano = date.getUTCFullYear();
      return `${dia}/${mes}/${ano}`;
    }
  } catch {
    // Ignora erro
  }

  return String(data);
}

/**
 * Gera cabeçalho do PDF
 */
function gerarCabecalho(doc: jsPDF, titulo: string) {
  // Logo da empresa (se disponível)
  try {
    // A logo será carregada antes da geração do PDF nas funções que chamam este método
    // Por enquanto, vamos adicionar espaço para a logo e renderizar o título abaixo
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('FC CENTRO AUTOMOTIVO', 105, 12, { align: 'center' });
    doc.text('OFICINA MECÂNICA', 105, 18, { align: 'center' });
  } catch (e) {
    // Se não conseguir carregar a logo, continua sem ela
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, 105, 28, { align: 'center' });

  // Formatar data e hora manualmente para garantir formato brasileiro
  const agora = new Date();
  const dia = String(agora.getDate()).padStart(2, '0');
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const ano = agora.getFullYear();
  const hora = String(agora.getHours()).padStart(2, '0');
  const minuto = String(agora.getMinutes()).padStart(2, '0');
  const dataHoraFormatada = `${dia}/${mes}/${ano} ${hora}:${minuto}`;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Data de Geração: ${dataHoraFormatada}`, 105, 35, { align: 'center' });

  return 42; // Retorna a posição Y onde o conteúdo deve começar
}

/**
 * Gera rodapé com numeração de páginas
 */
function gerarRodape(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Página ${i} de ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
}

/**
 * Mapeia nomes de campos para labels legíveis
 */
const labelsOS: Record<string, string> = {
  numero: 'Número',
  data_abertura: 'Data Abertura',
  data_fechamento: 'Data Fechamento',
  cliente_nome: 'Cliente',
  veiculo_placa: 'Placa',
  mecanico_nome: 'Mecânico',
  status: 'Status',
  valor_servicos: 'Valor Serviços',
  valor_pecas: 'Valor Peças',
  valor_final: 'Valor Final'
};

const labelsFinanceiro: Record<string, string> = {
  numero: 'Número',
  data_fechamento: 'Data Pagamento',
  cliente_nome: 'Cliente',
  valor_servicos: 'Valor Serviços',
  valor_pecas: 'Valor Peças',
  valor_final: 'Valor Final'
};

const labelsEstoque: Record<string, string> = {
  codigo: 'Código',
  nome: 'Nome',
  categoria: 'Categoria',
  quantidade_estoque: 'Qtd.',
  preco_custo: 'Preço Custo',
  preco_venda: 'Preço Venda',
  valor_total_custo: 'Total Custo',
  valor_total_venda: 'Total Venda',
  margem_lucro: 'Margem (%)'
};

/**
 * Gera PDF de Relatório de OS
 */
export function gerarPDFRelatorioOS(campos: string[], dados: DadosRelatorio, filtros: any) {
  const doc = new jsPDF();
  const startY = gerarCabecalho(doc, 'Relatório de Ordens de Serviço');

  // Informações de filtros
  let filterY = startY + 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Filtros Aplicados:', 14, filterY);

  filterY += 5;
  doc.setFont('helvetica', 'normal');
  if (filtros.data_inicio) {
    doc.text(`Período: ${formatarData(filtros.data_inicio)} até ${formatarData(filtros.data_fim || new Date().toISOString())}`, 14, filterY);
    filterY += 5;
  }
  if (filtros.status) {
    doc.text(`Status: ${filtros.status}`, 14, filterY);
    filterY += 5;
  }
  if (filtros.busca) {
    doc.text(`Busca: ${filtros.busca}`, 14, filterY);
    filterY += 5;
  }

  // Preparar colunas
  const colunas: ColunaTabela[] = campos.map(campo => ({
    header: labelsOS[campo] || campo,
    dataKey: campo
  }));

  // Preparar dados (formatar valores)
  const dadosFormatados = dados.dados.map(item => {
    const itemFormatado: any = {};
    campos.forEach(campo => {
      if (campo.includes('valor_') || campo.includes('preco_')) {
        itemFormatado[campo] = formatarMoeda(item[campo] || 0);
      } else if (campo.includes('data_')) {
        itemFormatado[campo] = formatarData(item[campo]);
      } else {
        itemFormatado[campo] = item[campo] || '-';
      }
    });
    return itemFormatado;
  });

  // Gerar tabela
  autoTable(doc, {
    startY: filterY + 5,
    head: [colunas.map(c => c.header)],
    body: dadosFormatados.map(item => colunas.map(c => item[c.dataKey])),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [255, 107, 0], textColor: 255, fontStyle: 'bold' }, // Laranja FC
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { top: 10 }
  });

  // Totalizadores
  if (dados.totalizadores) {
    const finalY = (doc as any).lastAutoTable.finalY || filterY + 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Totalizadores:', 14, finalY + 10);

    doc.setFont('helvetica', 'normal');
    doc.text(`Total de Registros: ${dados.totalizadores.total_registros}`, 14, finalY + 16);
    doc.text(`Total em Serviços: ${formatarMoeda(dados.totalizadores.total_valor_servicos)}`, 14, finalY + 22);
    doc.text(`Total em Peças: ${formatarMoeda(dados.totalizadores.total_valor_pecas)}`, 14, finalY + 28);
    doc.text(`Valor Total: ${formatarMoeda(dados.totalizadores.total_valor_final)}`, 14, finalY + 34);
  }

  gerarRodape(doc);
  doc.save(`relatorio-os-${new Date().getTime()}.pdf`);
}

/**
 * Gera PDF de Relatório Financeiro
 */
export function gerarPDFRelatorioFinanceiro(campos: string[], dados: DadosRelatorio, filtros: any) {
  const doc = new jsPDF();
  const startY = gerarCabecalho(doc, 'Relatório Financeiro');

  // Informações de filtros
  let filterY = startY + 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Filtros Aplicados:', 14, filterY);

  filterY += 5;
  doc.setFont('helvetica', 'normal');
  if (filtros.data_inicio) {
    doc.text(`Período: ${formatarData(filtros.data_inicio)} até ${formatarData(filtros.data_fim || new Date().toISOString())}`, 14, filterY);
    filterY += 5;
  }
  if (filtros.busca) {
    doc.text(`Busca: ${filtros.busca}`, 14, filterY);
    filterY += 5;
  }

  // Preparar colunas
  const colunas: ColunaTabela[] = campos.map(campo => ({
    header: labelsFinanceiro[campo] || campo,
    dataKey: campo
  }));

  // Preparar dados
  const dadosFormatados = dados.dados.map(item => {
    const itemFormatado: any = {};
    campos.forEach(campo => {
      if (campo.includes('valor_') || campo.includes('preco_')) {
        itemFormatado[campo] = formatarMoeda(item[campo] || 0);
      } else if (campo.includes('data_')) {
        itemFormatado[campo] = formatarData(item[campo]);
      } else {
        itemFormatado[campo] = item[campo] || '-';
      }
    });
    return itemFormatado;
  });

  // Gerar tabela
  autoTable(doc, {
    startY: filterY + 5,
    head: [colunas.map(c => c.header)],
    body: dadosFormatados.map(item => colunas.map(c => item[c.dataKey])),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [255, 107, 0], textColor: 255, fontStyle: 'bold' }, // Laranja FC
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { top: 10 }
  });

  // Totalizadores
  if (dados.totalizadores) {
    const finalY = (doc as any).lastAutoTable.finalY || filterY + 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Totalizadores:', 14, finalY + 10);

    doc.setFont('helvetica', 'normal');
    doc.text(`Total de Registros: ${dados.totalizadores.total_registros}`, 14, finalY + 16);
    doc.text(`Total em Serviços: ${formatarMoeda(dados.totalizadores.total_valor_servicos)}`, 14, finalY + 22);
    doc.text(`Total em Peças: ${formatarMoeda(dados.totalizadores.total_valor_pecas)}`, 14, finalY + 28);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL GERAL: ${formatarMoeda(dados.totalizadores.total_valor_final)}`, 14, finalY + 36);
  }

  gerarRodape(doc);
  doc.save(`relatorio-financeiro-${new Date().getTime()}.pdf`);
}

/**
 * Gera PDF de Relatório de Estoque
 */
export function gerarPDFRelatorioEstoque(campos: string[], dados: DadosRelatorio, filtros: any) {
  const doc = new jsPDF();
  const startY = gerarCabecalho(doc, 'Relatório de Estoque');

  // Informações de filtros
  let filterY = startY + 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Filtros Aplicados:', 14, filterY);

  filterY += 5;
  doc.setFont('helvetica', 'normal');
  if (filtros.categoria) {
    doc.text(`Categoria: ${filtros.categoria}`, 14, filterY);
    filterY += 5;
  }
  if (filtros.busca) {
    doc.text(`Busca: ${filtros.busca}`, 14, filterY);
    filterY += 5;
  }
  if (filtros.estoque_baixo) {
    doc.text('Mostrando apenas: Itens com estoque baixo', 14, filterY);
    filterY += 5;
  }

  // Preparar colunas
  const colunas: ColunaTabela[] = campos.map(campo => ({
    header: labelsEstoque[campo] || campo,
    dataKey: campo
  }));

  // Preparar dados
  const dadosFormatados = dados.dados.map(item => {
    const itemFormatado: any = {};
    campos.forEach(campo => {
      if (campo.includes('valor_') || campo.includes('preco_')) {
        itemFormatado[campo] = formatarMoeda(item[campo] || 0);
      } else if (campo === 'margem_lucro') {
        itemFormatado[campo] = item[campo] ? `${item[campo].toFixed(2)}%` : '-';
      } else {
        itemFormatado[campo] = item[campo] || '-';
      }
    });
    return itemFormatado;
  });

  // Gerar tabela
  autoTable(doc, {
    startY: filterY + 5,
    head: [colunas.map(c => c.header)],
    body: dadosFormatados.map(item => colunas.map(c => item[c.dataKey])),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [255, 107, 0], textColor: 255, fontStyle: 'bold' }, // Laranja FC
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { top: 10 }
  });

  // Totalizadores
  if (dados.totalizadores) {
    const finalY = (doc as any).lastAutoTable.finalY || filterY + 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Totalizadores:', 14, finalY + 10);

    doc.setFont('helvetica', 'normal');
    doc.text(`Total de Itens: ${dados.totalizadores.total_itens}`, 14, finalY + 16);
    doc.text(`Valor Total em Estoque (Custo): ${formatarMoeda(dados.totalizadores.valor_total_custo)}`, 14, finalY + 22);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Valor Potencial (Venda): ${formatarMoeda(dados.totalizadores.valor_total_venda)}`, 14, finalY + 30);
  }

  gerarRodape(doc);
  doc.save(`relatorio-estoque-${new Date().getTime()}.pdf`);
}
