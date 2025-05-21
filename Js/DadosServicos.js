const nomeCidade = localStorage.getItem("nomeCidade");
let botoesAtivados = false;
let abas = document.querySelectorAll(".aba");

// Função para buscar dados do backend (Netlify Functions)
async function fetchSecao(type) {
  const cidade = encodeURIComponent(localStorage.getItem("nomeCidade"));
  const res = await fetch(`/.netlify/functions/getHealthData?type=postos&cidade=${encodeURIComponent(nomeCidade)}`);
  if (!res.ok) throw new Error(`Erro ao buscar dados: ${res.statusText}`);
  return await res.json();
}

// Definição das seções de Saúde (render permanece igual)
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

// Seções estáticas para Educação, Emergência e outros (mantém a estrutura original)
const secoesEducacao = {};
const secoesEmergencia = {};
const secoesAssitenciaSocial = {};
const secoesServicosPrefeitura = {};

// Adiciona eventos de clique nas abas
function addClick(secoes) {
  abas = document.querySelectorAll(".aba");
  abas.forEach(aba => {
    aba.addEventListener("click", () => {
      trocarAba(aba.id, secoes);
    });
  });
}

// Troca a aba ativa e carrega dados (dinâmicos para Saúde)
async function trocarAba(abaID, secoes) {
  // Marca aba ativa
  abas.forEach(aba => aba.classList.remove("ativa"));
  document.getElementById(abaID).classList.add("ativa");

  // Esconde todas as seções
  for (const key in secoes) {
    secoes[key].container.classList.add("hidden");
  }

  // Mostra a seção selecionada
  const secao = secoes[abaID];
  secao.container.classList.remove("hidden");

  // Limpa conteúdo antigo
  secao.container.innerHTML = "";

  // Obtém dados (fetch para Saúde ou dados estáticos)
  let items = [];
  if (secoes === secoesSaude) {
    items = await fetchSecao(abaID);
  } else if (secao.dados) {
    items = secao.dados;
  }

  // Renderiza cartões
  items.forEach(item => {
    secao.container.innerHTML += secao.render(item);
  });

  // Ativa botões
  botoesAtivados = false;
  botoesDosCartoes();
}

// Prepara ambiente ao entrar na página certa
function preparaAmbiente() {
  if (window.location.href.includes("PaginaSaude.html")) {
    addClick(secoesSaude);
    trocarAba("postos", secoesSaude);
  } else if (window.location.href.includes("Educacao.html")) {
    addClick(secoesEducacao);
    trocarAba("matriculas", secoesEducacao);
  } else {
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

// Inicialização
preparaAmbiente();
