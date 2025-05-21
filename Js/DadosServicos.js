const nomeCidade = localStorage.getItem("nomeCidade");
let botoesAtivados = false;
let abas = [];

// Função para buscar dados do backend
async function fetchSecao(type) {
  try {
    const cidade = encodeURIComponent(nomeCidade);
    const res = await fetch(`/.netlify/functions/getHealthData?type=${type}&cidade=${cidade}`);
    
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Erro no fetchSecao:", error);
    return [];
  }
}

// Seções de Saúde corrigidas
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

// Função para adicionar eventos corrigida
function addClick(secoes) {
  abas = document.querySelectorAll(".aba");
  if (!abas.length) {
    console.error("Nenhuma aba encontrada!");
    return;
  }

  abas.forEach(aba => {
    aba.addEventListener("click", () => trocarAba(aba.id, secoes));
  });
}

// Função trocarAba corrigida
async function trocarAba(abaID, secoes) {
  try {
    // Verificação de segurança
    if (!secoes[abaID]?.container) {
      console.error(`Seção ${abaID} não encontrada!`);
      return;
    }

    // Atualização das classes
    abas.forEach(aba => aba.classList.remove("ativa"));
    const abaAtiva = document.getElementById(abaID);
    if (abaAtiva) abaAtiva.classList.add("ativa");

    // Manipulação dos containers
    Object.values(secoes).forEach(secao => {
      if (secao.container) {
        secao.container.classList.add("hidden");
        secao.container.innerHTML = "";
      }
    });

    const secao = secoes[abaID];
    secao.container.classList.remove("hidden");

    // Carregar dados
    const items = secoes === secoesSaude 
      ? await fetchSecao(abaID)
      : secao.dados || [];

    // Renderização
    items.forEach(item => {
      secao.container.innerHTML += secao.render(item);
    });

    botoesDosCartoes();
  } catch (error) {
    console.error("Erro na troca de aba:", error);
  }
}

// Função preparaAmbiente atualizada
function preparaAmbiente() {
  const path = window.location.pathname;
  
  if (path.includes("PaginaSaude.html")) {
    addClick(secoesSaude);
    trocarAba("postos", secoesSaude);
  } else if (path.includes("Educacao.html")) {
    addClick(secoesEducacao);
    trocarAba("matriculas", secoesEducacao);
  } else if (path.includes("Emergencia.html")) {
    addClick(secoesEmergencia);
    trocarAba("telefones", secoesEmergencia);
  } else {
    console.warn("Ambiente não reconhecido:", path);
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

// Inicialização
preparaAmbiente();
