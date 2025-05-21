const nomeCidade = localStorage.getItem("nomeCidade");
let botoesAtivados = false;
let abas = document.querySelectorAll(".aba");

// Os objetos de uma secao devem ter o mesmo nome que a id da sua respectiva aba

const secoesSaude = {
  postos: {
    container: document.getElementById("postosMenu"),
    dados: [
      {
        nome: "Posto de Saúde João Paulo II",
        horario: "07h às 17h, de segunda a sexta",
        documentos: "RG e Cartão SUS",
        telefone: "(99) 90000-000",
        endereco: "Rua das Flores, nº 100 - Centro"
      },
      {
        nome: "Posto de Saúde Santa Ana",
        horario: "07h às 17h, de segunda a sexta",
        documentos: "RG e Cartão SUS",
        telefone: "(99) 91111-111",
        endereco: "Rua do Limoeiro, nº 32 - Goiás"
      },
      {
        nome: "Posto de Saúde Santa Ana",
        horario: "07h às 17h, de segunda a sexta",
        documentos: "RG e Cartão SUS",
        telefone: "(99) 91111-111",
        endereco: "Rua do Limoeiro, nº 32 - Goiás"
      },
      {
        nome: "Posto de Saúde Santa Ana",
        horario: "07h às 17h, de segunda a sexta",
        documentos: "RG e Cartão SUS",
        telefone: "(99) 91111-111",
        endereco: "Rua do Limoeiro, nº 32 - Goiás"
      },
      {
        nome: "Posto de Saúde Santa Ana",
        horario: "07h às 17h, de segunda a sexta",
        documentos: "RG e Cartão SUS",
        telefone: "(99) 91111-111",
        endereco: "Rua do Limoeiro, nº 32 - Goiás"
      }
    ],
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
    dados: [
      {
        nome: "UPA Cidade Operária",
        horario: "24h por dia, todo dia",
        documentos: "Nenhum é necessário",
        telefone: "(99) 98000-000",
        endereco: "Rua dos Golfos, nº 82 - Centro"
      },
      {
        nome: "UPA São João",
        horario: "24h por dia, todo dia",
        documentos: "Nenhum é necessário",
        telefone: "(99) 91111-111",
        endereco: "Rua Santa, nº 32 - Goiás"
      }
    ],
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
    dados: [
      {
        titulo: "Vacinação Contra Gripe (Influenza)",
        horario: "Sem dados",
        periodo: "Sem dados",
        documentos: "RG, Cartão SUS e Comprovante de Residência",
        locais: "Postos de saúde municipais"
      },
      {
        titulo: "Vacinação Infantil Contra Poliomielite",
        horario: "Sem dados",
        periodo: "10 a 20 de maio",
        documentos: "Cartão de Vacinação da Criança e RG do responsável",
        locais: "UBS da Cohama, Anjo da Guarda e Vinhais"
      }
    ],
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

const secoesEducacao = {};

const secoesEmergencia = {};

const secoesAssitenciaSocial = {};

const secoesServicosPrefeitura = {};


// Adiciona o click nas abas dos servicos (o parametro secoes é pra identificar o tipo de serviço (saude, educacao, etc))
function addClick(secoes) {
  abas = document.querySelectorAll(".aba");
  abas.forEach(aba => {
    aba.addEventListener("click", () => {
      trocarAba(aba.id, secoes);
    });
  });
}

// Função que troca as abas e renderiza os cartões dos serviços
function trocarAba(abaID, secoes) {
  // Remove a classe ativa de todas as abas e adiciona na aba atual
  abas.forEach(aba => aba.classList.remove("ativa"));
  document.getElementById(abaID).classList.add("ativa");

  // Poe a classe hidden em todas as seções
  for (const i in secoes) {
    secoes[i].container.classList.add("hidden");
  }

  // Mostra a aba atual. Secoes[id] pode ser secoes.posto, secoes.upa, etc
  const secao = secoes[abaID];
  secao.container.classList.remove("hidden");

  // Carrega os cartões (se ainda não tiver)
  if (secao.container.innerHTML.trim() === "") {
    secao.dados.forEach(cartao => {
      secao.container.innerHTML += secao.render(cartao);
    });
    botoesAtivados = false;
  }

  if (!botoesAtivados) {
    botoesDosCartoes();
  }
}

// Esssa parte é pra carregar uma seção logo ao entrar na pagina, e também por o click nas abas
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

// Ativa os botoes dos cartões
function botoesDosCartoes() {
  const botoes = document.querySelectorAll(".btn-primario");
  const botoesSecundarios = document.querySelectorAll(".btn-secundario");

  if (botoesAtivados) return;

  botoes.forEach(botao => {
    botao.addEventListener("click", () => {
      irLocalizacao(botao);
    });
  });

  botoesSecundarios.forEach(botao => {
    botao.addEventListener("click", () => {
      console.log("Sem funão ainda");
    });
  });

  botoesAtivados = true;
}

// Função que leva para o google maps com o endereço do cartão
function irLocalizacao(botao) {
  const cartao = botao.parentElement.parentElement; //Pega a div cartão
  const tagsP = cartao.querySelectorAll("p");       // Pega todas as tags p do cartão

  tagsP.forEach(p => {
    const textoP = p.innerHTML;

    //Se for a tag p certa, recorta dela apenas o texto referente ao endereco
    if (textoP.includes("Endereço:") || textoP.includes("Locais:")) {
      const inicio = textoP.indexOf("</strong>") + 9;

      let endereco = textoP.slice(inicio, textoP.length).trim();
      endereco = `${endereco} em ${nomeCidade}`;

      // Abre o google maps com o endereço
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`, "_blank");
    }
  });
}


preparaAmbiente();