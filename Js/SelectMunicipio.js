const usarCidade = document.querySelector(".botao");
const select = document.querySelector(".select");
const cidade = localStorage.getItem("valorSelect");

// Executa assim que a pagina inicia
autoFillSelect();
select.addEventListener("change", () => {
    activeButton();
});
usarCidade.addEventListener("click", () => {
    if (select.value === "Selecione uma cidade") {
        alert("Selecione uma cidade disponível");
    } else {
        localStorage.setItem("valorSelect", select.value);
        localStorage.setItem("nomeCidade", select.options[select.selectedIndex].text);
        window.location.href = "Index.html";
    }
});

// Ativa o botao Usar Cidade
function activeButton() {
    if (select.value === "Selecione uma cidade") {
        usarCidade.setAttribute("disabled", "true");
    } else {
        usarCidade.removeAttribute("disabled");
    }
}

// Preenche o select com a cidade salva no localStorage
function autoFillSelect() {
    if (cidade) {
        select.value = cidade;
        activeButton();
    }
}