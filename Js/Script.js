if (!window.location.href.includes("BemVindo.html")) {
  local();
}

function redirecionarPara(paginaHtml) {
  window.location.href = paginaHtml;
}

function local() {
  const cidade = localStorage.getItem("nomeCidade");
  if (!cidade) {
    alert("Você pulou uma etapa");
    window.location.href = "SelectMunicipio.html";
    return
  }

  const nomes = document.querySelectorAll(".nome-cidade");
  nomes.forEach(nome => {
    nome.textContent = cidade;
  });
}