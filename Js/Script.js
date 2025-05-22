// Script.js - Versão corrigida para fluxo de navegação adequado

// Função para redirecionar para outra página
function redirecionarPara(paginaHtml) {
  window.location.href = paginaHtml;
}

// Função para verificar e aplicar o nome da cidade
function verificarCidade() {
  // Verifica se estamos na página de seleção de município ou na página de boas-vindas
  // Estas páginas não precisam verificar se a cidade foi selecionada
  if (window.location.href.includes("SelectMunicipio.html") || 
      window.location.href.includes("BemVindo.html")) {
    console.log("Página de seleção ou boas-vindas, não verificando cidade");
    return;
  }
  
  // Para todas as outras páginas, verifica se a cidade foi selecionada
  const cidade = localStorage.getItem("nomeCidade");
  console.log("Verificando cidade:", cidade);
  
  if (!cidade) {
    console.log("Cidade não encontrada, redirecionando para seleção");
    alert("Você pulou uma etapa");
    
    // Determina o caminho correto para redirecionamento baseado na localização atual
    let redirectPath = "SelectMunicipio.html";
    if (window.location.href.includes("/Servicos/")) {
      redirectPath = "../SelectMunicipio.html";
    }
    
    window.location.href = redirectPath;
    return;
  }

  // Atualiza todos os elementos que mostram o nome da cidade
  const nomes = document.querySelectorAll(".nome-cidade");
  if (nomes.length > 0) {
    console.log("Atualizando elementos com nome da cidade:", cidade);
    nomes.forEach(nome => {
      nome.textContent = cidade;
    });
  }
}

// Executa a verificação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM carregado, verificando página atual");
  verificarCidade();
});
