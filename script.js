let todosContratos = [];

function carregarContratos(lista) {
  const tbody = document.querySelector("#tabela-contratos tbody");
  tbody.innerHTML = "";

  lista.forEach((contrato, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${contrato.apelido || "-"}</td>
      <td>${contrato.valor || "-"}</td>
      <td>${contrato.data || "-"}</td>
      <td>${contrato.endereco || "-"}</td>
      <td>${contrato.status || "-"}</td>
      <td><button onclick="verDetalhes(${index})">Ver Detalhes</button></td>
    `;
    tbody.appendChild(tr);
  });

  todosContratos = lista;
}

function verDetalhes(index) {
  const contrato = todosContratos[index];
  document.getElementById("det-apelido").textContent = contrato.apelido || "-";
  document.getElementById("det-valor").textContent = contrato.valor || "-";
  document.getElementById("det-data").textContent = contrato.data || "-";
  document.getElementById("det-endereco").textContent = contrato.endereco || "-";
  document.getElementById("det-status").textContent = contrato.status || "-";
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
    (c.data || "").toLowerCase().includes(termo) ||
    (c.endereco || "").toLowerCase().includes(termo) ||
    (c.status || "").toLowerCase().includes(termo)
  );
  carregarContratos(filtrados);
});

// 🔄 Substitua aqui pela URL pública CSV da aba "Contratos"
const URL_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT4-Byvx6MozOO0BkbOT4V60ekea-cr0Cywf_8wvHSEno2RUW8luLJG3C5RpSjKZK8tZx8GFaXtjVhg/pub?gid=0&single=true&output=csv";

fetch(URL_CSV)
  .then(response => response.text())
  .then(csvText => {
    const linhas = csvText.trim().split("\n");
    const cabecalhos = linhas[0].split(",").map(c => c.trim().toLowerCase().replace(/\s/g, ''));

    const contratos = linhas.slice(1).map(linha => {
      const valores = linha.split(",");
      const contrato = {};
      cabecalhos.forEach((coluna, i) => {
        contrato[coluna] = valores[i]?.replace(/^"|"$/g, "").trim(); // remove aspas e espaços
      });
      return contrato;
    });

    carregarContratos(contratos);
  })
  .catch(error => {
    console.error("Erro ao carregar CSV:", error);
  });
