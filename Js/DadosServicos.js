// Js/DadosServicos.js - Refatorado para evitar erros em outras páginas
const nomeCidade = localStorage.getItem("nomeCidade");
let botoesAtivados = false;
let secoes = {};

// Busca os dados do backend
async function fetchSecao(type) {
  const cidade = encodeURIComponent(nomeCidade);
  const res = await fetch(`/.netlify/functions/getHealthData?type=${type}&cidade=${cidade}`);
  if (!res.ok) throw new Error(`Erro ao buscar dados: ${res.statusText}`);
  return await res.json();
}

// Função de render para cartões de Saúde
const renderSaude = {
  postos: posto => `
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
  `,
  upas: upa => `
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
  `,
  campanhas: campanha => `
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
};

// Adiciona evento de clique nas abas
function addClick() {
  const abas = document.querySelectorAll(".aba");
  abas.forEach(aba => aba.addEventListener("click", async () => {
    await trocarAba(aba.id);
  }));
}

// Troca de aba e renderização
async function trocarAba(abaID) {
  const config = secoes;
  const abaBtn = document.getElementById(abaID);
  if (!abaBtn || !config[abaID]) return;

  // ativa/desativa abas
  document.querySelectorAll(".aba").forEach(el => el.classList.remove("ativa"));
  abaBtn.classList.add("ativa");

  // esconde todas seções
  Object.values(config).forEach(sec => sec.container.classList.add("hidden"));

  // mostra a seção atual
  const secao = config[abaID];
  secao.container.classList.remove("hidden");

  // renderiza conteúdo
  secao.container.innerHTML = "";
  const items = await fetchSecao(abaID);
  items.forEach(item => secao.container.innerHTML += renderSaude[abaID](item));

  // ativa botões dentro dos cartões
  botoesAtivados = false;
  botoesDosCartoes();
}

// Botões de ações dos cartões
function botoesDosCartoes() {
  if (botoesAtivados) return;
  document.querySelectorAll(".btn-primario").forEach(botao => botao.addEventListener("click", () => irLocalizacao(botao)));
  document.querySelectorAll(".btn-secundario").forEach(botao => botao.addEventListener("click", () => console.log("Detalhes não implementado")));
  botoesAtivados = true;
}

// Abre o Google Maps para o endereço
function irLocalizacao(botao) {
  const cartao = botao.closest(".cartao");
  const enderecoTag = Array.from(cartao.querySelectorAll("p")).find(p => p.innerHTML.includes("Endereço:") || p.innerHTML.includes("Locais:"));
  if (!enderecoTag) return;
  const texto = enderecoTag.innerHTML.split('</strong>')[1].trim();
  const endereco = `${texto} em ${nomeCidade}`;
  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`, "_blank");
}

// Inicialização apenas para a página de Saúde
async function preparaSaude() {
  // somente em PaginaSaude.html
  if (!window.location.href.includes("PaginaSaude.html")) return;

  // define containers após DOM carregado
  secoes = {
    postos: { container: document.getElementById("postosMenu") },
    upas: { container: document.getElementById("upasMenu") },
    campanhas: { container: document.getElementById("campanhasMenu") }
  };

  addClick();
  await trocarAba("postos");
}

preparaSaude();
