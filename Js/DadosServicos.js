const nomeCidade = localStorage.getItem("nomeCidade");
let botoesAtivados = false;
let abas = [];

// Definição das seções de Saúde (usando IDs)
const secoesSaude = {
  postos: {
    containerId: "postosMenu",
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
    containerId: "upasMenu",
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
    containerId: "campanhasMenu",
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

// Função para buscar dados do backend
async function fetchSecao(type) {
  const cidade = encodeURIComponent(nomeCidade);
  try {
    const res = await fetch(`/.netlify/functions/getHealthData?type=${type}&cidade=${cidade}`);
    if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Erro ao buscar dados:", err);
    return [];
  }
}

// Adiciona eventos de clique nas abas
function addClick(secoes) {
  abas = document.querySelectorAll(".aba");
  abas.forEach(aba => {
    aba.addEventListener("click", async () => {
      try {
        await trocarAba(aba.id, secoes);
      } catch (err) {
        console.error("Erro ao trocar aba:", err);
      }
    });
  });
}

// Troca a aba ativa
async function trocarAba(abaID, secoes) {
  if (!abas.length) abas = document.querySelectorAll(".aba");
  abas.forEach(aba => aba.classList.remove("ativa"));
  const abaAtiva = document.getElementById(abaID);
  if (!abaAtiva) throw new Error(`Aba ${abaID} não encontrada`);
  abaAtiva.classList.add("ativa");

  const secao = secoes[abaID];
  if (!secao) throw new Error(`Seção para aba ${abaID} não existe`);
  const container = document.getElementById(secao.containerId);
  if (!container) throw new Error(`Container ${secao.containerId} não encontrado`);

  // Esconde todas as seções
  Object.values(secoes).forEach(s => {
    const c = document.getElementById(s.containerId);
    if (c) c.classList.add("hidden");
  });

  // Limpa e renderiza
  container.classList.remove("hidden");
  container.innerHTML = "";
  const items = secoes === secoesSaude ? await fetchSecao(abaID) : [];
  items.forEach(item => {
    container.innerHTML += secao.render(item);
  });

  botoesDosCartoes();
}

// Prepara ambiente após DOM carregar
function preparaAmbiente() {
  if (window.location.href.includes("PaginaSaude.html")) {
    addClick(secoesSaude);
    trocarAba("postos", secoesSaude);
  } else if (window.location.href.includes("Educacao.html")) {
    // Lógica para educação (se necessário)
  } else {
    // Lógica para emergência (se necessário)
  }
}

// Ativa botões dos cartões
function botoesDosCartoes() {
  if (botoesAtivados) return;
  document.querySelectorAll(".btn-primario").forEach(botao => {
    botao.addEventListener("click", irLocalizacao);
  });
  botoesAtivados = true;
}

// Função para abrir mapa
function irLocalizacao(botao) {
  const endereco = botao.closest(".cartao").querySelector("p:last-child").innerText.split(": ")[1];
  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`, "_blank");
}

// Inicialização após DOM estar pronto
document.addEventListener("DOMContentLoaded", preparaAmbiente);