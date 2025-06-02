let todosContratos = [];

function carregarContratos(lista) {
  const tbody = document.querySelector("#tabela-contratos tbody");
  tbody.innerHTML = "";

  lista.forEach((contrato, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${contrato.apelido || ""}</td>
      <td>${contrato.valor || ""}</td>
      <td>${contrato.data || ""}</td>
      <td>${contrato.endereco || ""}</td>
      <td>${contrato.status || ""}</td>
      <td><button onclick="verDetalhes(${index})">Ver Detalhes</button></td>
    `;
    tbody.appendChild(tr);
  });

  todosContratos = lista;
}

function verDetalhes(index) {
  const contrato = todosContratos[index];
  document.getElementById("det-apelido").textContent = contrato.apelido || "";
  document.getElementById("det-valor").textContent = contrato.valor || "";
  document.getElementById("det-data").textContent = contrato.data || "";
  document.getElementById("det-endereco").textContent = contrato.endereco || "";
  document.getElementById("det-status").textContent = contrato.status || "";
  document.getElementById("link-planilha").href = contrato.linkplanilha || "#";
  document.getElementById("link-pdf").href = contrato.linkpdf || "#";
  document.getElementById("detalhes").classList.remove("hidden");
}

function fecharDetalhes() {
  document.getElementById("detalhes").classList.add("hidden");
}

document.getElementById("filtro").addEventListener("input", e => {
  const termo = e.target.value.toLowerCase();
  const filtrados = todosContratos.filter(c =>
    (c.apelido || "").toLowerCase().includes(termo) ||
    (c.valor || "").toLowerCase().includes(termo) ||
    (c.status || "").toLowerCase().includes(termo)
  );
  carregarContratos(filtrados);
});

// 🔗 SUBSTITUA pela URL do seu Apps Script publicado:
fetch("https://script.google.com/macros/s/AKfycbzO-xrMMfrcBljhPTHnMHhChyYrzrohOYpxfOn-th5QWjvvhnjpE1hveXhgZPLyBuU/exec")
  .then(response => response.json())
  .then(contratos => carregarContratos(contratos))
  .catch(erro => console.error("Erro ao carregar contratos:", erro));
