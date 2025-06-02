let todosContratos = [];

function carregarContratos(lista) {
  const tbody = document.querySelector("#tabela-contratos tbody");
  tbody.innerHTML = "";

  lista.forEach((contrato, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${contrato.apelido}</td>
      <td>${contrato.valor || "R$ - indefinido"}</td>
      <td><button onclick="verDetalhes(${index})">Ver Detalhes</button></td>
    `;
    tbody.appendChild(tr);
  });

  todosContratos = lista;
}

function verDetalhes(index) {
  const contrato = todosContratos[index];
  document.getElementById("det-apelido").textContent = contrato.apelido;
  document.getElementById("det-valor").textContent = contrato.valor || "R$ - indefinido";
  document.getElementById("link-planilha").href = contrato.linkPlanilha;
  document.getElementById("link-pdf").href = contrato.linkPDF;
  document.getElementById("detalhes").classList.remove("hidden");
}

function fecharDetalhes() {
  document.getElementById("detalhes").classList.add("hidden");
}

document.getElementById("filtro").addEventListener("input", e => {
  const termo = e.target.value.toLowerCase();
  const filtrados = todosContratos.filter(c =>
    c.apelido.toLowerCase().includes(termo) ||
    (c.valor && c.valor.toLowerCase().includes(termo))
  );
  carregarContratos(filtrados);
});

// Substitua pela sua URL de Apps Script publicada
fetch("https://script.google.com/macros/s/AKfycbyhLizue36A4oj2kwlYnfOepafsHVWda94lHTqsCJ9C_pK9SGpKqlVEdLJym9QlUgAf/exec")
  .then(response => response.json())
  .then(contratos => {
    carregarContratos(contratos);
  })
  .catch(erro => {
    console.error("Erro ao carregar contratos:", erro);
  });
