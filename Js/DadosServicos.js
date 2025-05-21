// Aguarda o DOM estar completamente carregado antes de executar o script
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM carregado completamente");
  
  // Verifica se o nome da cidade está no localStorage
  const nomeCidade = localStorage.getItem("nomeCidade");
  console.log("Nome da cidade no localStorage:", nomeCidade);
  
  if (!nomeCidade) {
    console.error("Nome da cidade não encontrado no localStorage");
    alert("Selecione uma cidade primeiro");
    window.location.href = "../SelectMunicipio.html";
    return;
  }
  
  let botoesAtivados = false;
  
  // Função para buscar dados do backend com cache no sessionStorage
  async function fetchSecao(type) {
    console.log(`Verificando dados para seção: ${type}, cidade: ${nomeCidade}`);
    
    // Verifica se já existe no cache da sessão
    const cacheKey = `saude_${type}_${nomeCidade}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    
    if (cachedData) {
      console.log(`Usando dados em cache para ${type}`);
      return JSON.parse(cachedData);
    }
    
    console.log(`Buscando dados da API para seção: ${type}, cidade: ${nomeCidade}`);
    try {
      // Determina o caminho correto da API baseado no ambiente
      const apiPath = window.location.hostname.includes('netlify.app') 
        ? '/.netlify/functions/getHealthData' 
        : '/netlify/functions/getHealthData';
      
      const url = `${apiPath}?type=${type}&cidade=${encodeURIComponent(nomeCidade)}`;
      console.log("URL da requisição:", url);
      
      const res = await fetch(url);
      console.log("Status da resposta:", res.status);
      
      if (!res.ok) {
        throw new Error(`Erro HTTP: ${res.status} - ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log(`Dados recebidos para ${type}:`, data);
      
      // Salva no cache da sessão
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
      
      return data;
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      // Retorna null em caso de erro para mostrar mensagem
      return null;
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

  // Verifica se os containers existem
  console.log("Verificando containers:");
  for (const key in secoesSaude) {
    const container = document.getElementById(key + "Menu");
    console.log(`Container ${key}Menu:`, container ? "Encontrado" : "Não encontrado");
    secoesSaude[key].container = container;
  }

  // Adiciona eventos de clique nas abas
  function addClick() {
    console.log("Adicionando eventos de clique às abas");
    const abasElements = document.querySelectorAll(".aba");
    console.log("Abas encontradas:", abasElements.length);
    
    if (!abasElements || abasElements.length === 0) {
      console.error("Nenhuma aba encontrada no DOM");
      return;
    }
    
    abasElements.forEach(aba => {
      console.log(`Configurando aba: ${aba.id}`);
      
      // Remover eventos anteriores para evitar duplicação
      aba.removeEventListener("click", abaClickHandler);
      
      // Adicionar novo evento de clique
      aba.addEventListener("click", abaClickHandler);
      
      function abaClickHandler(event) {
        event.preventDefault();
        console.log("Aba clicada:", aba.id);
        trocarAba(aba.id);
      }
    });
  }

  // Troca a aba ativa e carrega dados
  async function trocarAba(abaID) {
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
    for (const key in secoesSaude) {
      if (secoesSaude[key].container) {
        secoesSaude[key].container.classList.add("hidden");
      }
    }

    // Verifica se a seção selecionada existe
    const secao = secoesSaude[abaID];
    if (!secao || !secao.container) {
      console.error(`Seção ou container para ${abaID} não encontrado`);
      return;
    }

    // Mostra a seção selecionada
    secao.container.classList.remove("hidden");

    // Limpa conteúdo antigo
    secao.container.innerHTML = '<p class="carregando">Carregando dados...</p>';

    // Obtém dados (fetch para Saúde ou dados estáticos)
    try {
      // Tenta buscar dados da API (com cache)
      const items = await fetchSecao(abaID);
      
      // Limpa o container antes de renderizar
      secao.container.innerHTML = "";
      
      // Renderiza cartões ou mensagem de erro
      if (items && items.length > 0) {
        items.forEach(item => {
          secao.container.innerHTML += secao.render(item);
        });
      } else if (items === null) {
        // Caso de erro na API
        secao.container.innerHTML = `
          <div class="mensagem-erro">
            <i class="fas fa-exclamation-circle"></i>
            <p>Não foi possível carregar os dados. Por favor, tente novamente mais tarde.</p>
          </div>
        `;
      } else {
        // Caso de array vazio
        secao.container.innerHTML = `
          <div class="mensagem-vazio">
            <i class="fas fa-info-circle"></i>
            <p>Não há dados disponíveis para ${abaID} em ${nomeCidade}.</p>
          </div>
        `;
      }

      // Ativa botões
      botoesAtivados = false;
      botoesDosCartoes();
    } catch (error) {
      console.error(`Erro ao carregar dados para ${abaID}:`, error);
      
      secao.container.innerHTML = `
        <div class="mensagem-erro">
          <i class="fas fa-exclamation-circle"></i>
          <p>Ocorreu um erro ao processar os dados. Por favor, tente novamente mais tarde.</p>
        </div>
      `;
    }
  }

  // Prepara ambiente ao entrar na página certa
  function preparaAmbiente() {
    console.log("Preparando ambiente...");
    console.log("URL atual:", window.location.href);
    
    if (window.location.href.includes("PaginaSaude") || window.location.href.includes("paginasaude")) {
      console.log("Página de Saúde detectada");
      addClick();
      trocarAba("postos");
    }
  }

  // Ativa eventos dos botões dentro dos cartões
  function botoesDosCartoes() {
    if (botoesAtivados) return;

    const botoes = document.querySelectorAll(".btn-primario");
    const botoesSecundarios = document.querySelectorAll(".btn-secundario");

    console.log("Botões primários encontrados:", botoes.length);
    console.log("Botões secundários encontrados:", botoesSecundarios.length);

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

  // Função para limpar o cache (útil para testes)
  window.limparCache = function() {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('saude_')) {
        sessionStorage.removeItem(key);
      }
    });
    console.log("Cache de dados de saúde limpo");
    alert("Cache limpo. Recarregue a página para buscar novos dados.");
  };

  // Inicialização com pequeno atraso para garantir que todos os elementos estejam carregados
  console.log("Iniciando com pequeno atraso...");
  setTimeout(preparaAmbiente, 100);
});
