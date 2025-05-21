// Aguarda o DOM estar completamente carregado antes de executar o script
document.addEventListener('DOMContentLoaded', function() {
  const nomeCidade = localStorage.getItem("nomeCidade");
  let botoesAtivados = false;
  
  // Função para buscar dados do backend (Netlify Functions)
  async function fetchSecao(type) {
    try {
      const res = await fetch(`/netlify/functions/getHealthData?type=${type}&cidade=${encodeURIComponent(nomeCidade)}`);
      if (!res.ok) throw new Error(`Erro ao buscar dados: ${res.statusText}`);
      return await res.json();
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      return []; // Retorna array vazio em caso de erro para evitar quebra do código
    }
  }

  // Definição das seções de Saúde
  const secoesSaude = {
    postos: {
      container: document.getElementById("postosMenu"),
      render: posto => `
        <div class="cartao">
          <h3>${posto.nome}</h3>
          <p><i class="fas fa-calendar-alt"></i><strong> Horário:</strong> ${posto.horario}</p>
          <p><i class="fas fa-id-card"></i><strong> Documentos:</strong> ${posto.documentos}</p>
          <p><i class="fas fa-phone"></i><strong> Telefone:</strong> ${posto.telefone}</p>
          <p><i class="fas fa-map-marker-alt"></i><strong> Endereço:</strong> ${posto.endereco}</p>
          <div class="acoes">
            <button class="btn-secundario">Ver em Detalhes</button>
            <button class="btn-primario">Ver no Mapa</button>
          </div>
        </div>
      `
    },
    upas: {
      container: document.getElementById("upasMenu"),
      render: upa => `
        <div class="cartao">
          <h3>${upa.nome}</h3>
          <p><i class="fas fa-calendar-alt"></i><strong> Horário:</strong> ${upa.horario}</p>
          <p><i class="fas fa-id-card"></i><strong> Documentos:</strong> ${upa.documentos}</p>
          <p><i class="fas fa-phone"></i><strong> Telefone:</strong> ${upa.telefone}</p>
          <p><i class="fas fa-map-marker-alt"></i><strong> Endereço:</strong> ${upa.endereco}</p>
          <div class="acoes">
            <button class="btn-secundario">Ver em Detalhes</button>
            <button class="btn-primario">Ver no Mapa</button>
          </div>
        </div>
      `
    },
    campanhas: {
      container: document.getElementById("campanhasMenu"),
      render: campanha => `
        <div class="cartao">
          <h3>${campanha.titulo}</h3>
          <p><i class="fas fa-calendar-alt"></i><strong> Horário:</strong> ${campanha.horario}</p>
          <p><i class="fas fa-clock"></i><strong> Período:</strong> ${campanha.periodo}</p>
          <p><i class="fas fa-id-card"></i><strong> Documentos:</strong> ${campanha.documentos}</p>
          <p><i class="fas fa-map-marker-alt"></i><strong> Locais:</strong> ${campanha.locais}</p>
          <div class="acoes">
            <button class="btn-secundario">Ver em Detalhes</button>
          </div>
        </div>
      `
    }
  };

  // Seções estáticas para Educação, Emergência e outros
  const secoesEducacao = {
    matriculas: {
      container: document.getElementById("matriculasMenu"),
      dados: [],
      render: () => ``
    },
    escolasPublicas: {
      container: document.getElementById("escolasPublicasMenu"),
      dados: [],
      render: () => ``
    },
    programas: {
      container: document.getElementById("programasMenu"),
      dados: [],
      render: () => ``
    }
  };

  const secoesEmergencia = {
    telefones: {
      container: document.getElementById("telefonesMenu"),
      dados: [],
      render: () => ``
    },
    unidadeUe: {
      container: document.getElementById("unidadeUeMenu"),
      dados: [],
      render: () => ``
    },
    guia: {
      container: document.getElementById("guiaMenu"),
      dados: [],
      render: () => ``
    }
  };

  // Adiciona eventos de clique nas abas - CORREÇÃO: Simplificado para garantir funcionamento
  function addClick(secoes) {
    const abasElements = document.querySelectorAll(".aba");
    console.log("Abas encontradas:", abasElements.length);
    
    abasElements.forEach(aba => {
      // Remove qualquer evento anterior para evitar duplicação
      aba.removeEventListener("click", abaClickHandler);
      
      // Adiciona o novo evento de clique
      aba.addEventListener("click", abaClickHandler);
      
      function abaClickHandler() {
        console.log("Aba clicada:", aba.id);
        trocarAba(aba.id, secoes);
      }
    });
  }

  // Troca a aba ativa e carrega dados
  async function trocarAba(abaID, secoes) {
    console.log("Trocando para aba:", abaID);
    
    // Marca aba ativa
    const abasElements = document.querySelectorAll(".aba");
    abasElements.forEach(aba => aba.classList.remove("ativa"));
    
    const abaAtual = document.getElementById(abaID);
    if (abaAtual) {
      abaAtual.classList.add("ativa");
    } else {
      console.error(`Aba com ID ${abaID} não encontrada`);
      return;
    }

    // Esconde todas as seções
    for (const key in secoes) {
      if (secoes[key].container) {
        secoes[key].container.classList.add("hidden");
      }
    }

    // Verifica se a seção selecionada existe
    const secao = secoes[abaID];
    if (!secao || !secao.container) {
      console.error(`Seção ou container para ${abaID} não encontrado`);
      return;
    }

    // Mostra a seção selecionada
    secao.container.classList.remove("hidden");

    // Limpa conteúdo antigo
    secao.container.innerHTML = "";

    // Obtém dados (fetch para Saúde ou dados estáticos)
    let items = [];
    try {
      if (secoes === secoesSaude) {
        items = await fetchSecao(abaID);
      } else if (secao.dados) {
        items = secao.dados;
      }

      // Renderiza cartões
      if (items && items.length > 0) {
        items.forEach(item => {
          secao.container.innerHTML += secao.render(item);
        });
      } else {
        secao.container.innerHTML = '<p class="sem-dados">Nenhum dado disponível para esta seção.</p>';
      }

      // Ativa botões
      botoesAtivados = false;
      botoesDosCartoes();
    } catch (error) {
      console.error(`Erro ao carregar dados para ${abaID}:`, error);
      secao.container.innerHTML = '<p class="erro">Erro ao carregar dados. Tente novamente mais tarde.</p>';
    }
  }

  // Prepara ambiente ao entrar na página certa
  function preparaAmbiente() {
    console.log("Preparando ambiente...");
    console.log("URL atual:", window.location.href);
    
    if (window.location.href.includes("PaginaSaude.html")) {
      console.log("Página de Saúde detectada");
      addClick(secoesSaude);
      trocarAba("postos", secoesSaude);
    } else if (window.location.href.includes("Educacao.html")) {
      console.log("Página de Educação detectada");
      addClick(secoesEducacao);
      trocarAba("matriculas", secoesEducacao);
    } else if (window.location.href.includes("Emergencia.html")) {
      console.log("Página de Emergência detectada");
      addClick(secoesEmergencia);
      trocarAba("telefones", secoesEmergencia);
    }
  }

  // Ativa eventos dos botões dentro dos cartões
  function botoesDosCartoes() {
    if (botoesAtivados) return;

    const botoes = document.querySelectorAll(".btn-primario");
    const botoesSecundarios = document.querySelectorAll(".btn-secundario");

    botoes.forEach(botao => {
      botao.addEventListener("click", () => {
        irLocalizacao(botao);
      });
    });

    botoesSecundarios.forEach(botao => {
      botao.addEventListener("click", () => {
        console.log("Sem função ainda");
      });
    });

    botoesAtivados = true;
  }

  // Abre Google Maps com o endereço do cartão
  function irLocalizacao(botao) {
    const cartao = botao.closest(".cartao");
    const pTags = cartao.querySelectorAll("p");

    pTags.forEach(p => {
      const html = p.innerHTML;
      if (html.includes("Endereço:") || html.includes("Locais:")) {
        const texto = html.split('</strong>')[1].trim();
        const endereco = `${texto} em ${nomeCidade}`;
        window.open(
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`,
          "_blank"
        );
      }
    });
  }

  // Inicialização com pequeno atraso para garantir que todos os elementos estejam carregados
  setTimeout(preparaAmbiente, 100);
});
