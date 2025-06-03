let todosContratos = [];

function parseCSV(textoCSV) {
  const linhas = [];
  const chars = textoCSV.split('');
  let i = 0;

  while (i < chars.length) {
    const linha = [];
    let campo = '';
    let dentroAspas = false;

    while (i < chars.length) {
      const c = chars[i];

      if (c === '"' && !dentroAspas) {
        dentroAspas = true;
        i++;
      } else if (c === '"' && dentroAspas) {
        if (i + 1 < chars.length && chars[i + 1] === '"') {
          campo += '"';
          i += 2;
        } else {
          dentroAspas = false;
          i++;
        }
      } else if (c === ',' && !dentroAspas) {
        linha.push(campo);
        campo = '';
        i++;
      } else if ((c === '\r' || c === '\n') && !dentroAspas) {
        linha.push(campo);
        campo = '';
        while (i < chars.length && (chars[i] === '\r' || chars[i] === '\n')) {
          i++;
        }
        break;
      } else {
        campo += c;
        i++;
      }
    }

    if (campo !== '' || chars[i - 1] === ',') {
      linha.push(campo);
    }

    const todosVazios = linha.every(val => val === '');
    if (!todosVazios) {
      linhas.push(linha);
    }
  }

  return linhas;
}

function removeAcentos(str) {
  return str.normalize("NFD").replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function carregarContratos(lista) {
  const tbody = document.querySelector("#tabela-contratos tbody");
  tbody.innerHTML = "";

  lista.forEach((contrato, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${contrato.nickname || "-"}</td>
      <td>${contrato.purchaseprice || "-"}</td>
      <td>${contrato.date || "-"}</td>
      <td>${contrato.adress || "-"}</td>
      <td>${contrato.status || "-"}</td>
      <td><button onclick="verDetalhes(${index})">Detail</button></td>
    `;
    tbody.appendChild(tr);
  });

  todosContratos = lista;
}

function verDetalhes(index) {
  const contrato = todosContratos[index];

  document.getElementById("det-nickname").textContent = contrato.nickname || "-";
  document.getElementById("det-purchaseprice").textContent = contrato.purchaseprice || "-";
  document.getElementById("det-date").textContent = contrato.date || "-";
  document.getElementById("det-adress").textContent = contrato.adress || "-";
  document.getElementById("det-status").textContent = contrato.status || "-";
  document.getElementById("det-incentive").textContent = contrato.incentive || "-";
  document.getElementById("det-financedprice").textContent = contrato.financedprice || "-";
  document.getElementById("det-downpayment").textContent = contrato.downpayment || "-";
  document.getElementById("det-financedamount").textContent = contrato.financedamount || "-";
  document.getElementById("det-closingcosts").textContent = contrato.closingcosts || "-";
  document.getElementById("det-acquisitionexpense").textContent = contrato.acquisitionexpense || "-";
  document.getElementById("det-interestrateyear").textContent = contrato.interestrateyear || "-";
  document.getElementById("det-terminyearloan").textContent = contrato.terminyearloan || "-";
  document.getElementById("det-mortagepayment").textContent = contrato.mortagepayment || "-";

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
    (c.nickname || "").toLowerCase().includes(termo) ||
    (c.purchaseprice || "").toLowerCase().includes(termo) ||
    (c.date || "").toLowerCase().includes(termo) ||
    (c.adress || "").toLowerCase().includes(termo) ||
    (c.status || "").toLowerCase().includes(termo)
  );
  carregarContratos(filtrados);
});

const URL_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT4-Byvx6MozOO0BkbOT4V60ekea-cr0Cywf_8wvHSEno2RUW8luLJG3C5RpSjKZK8tZx8GFaXtjVhg/pub?gid=0&single=true&output=csv";

fetch(URL_CSV)
  .then(response => response.text())
  .then(csvText => {
    const linhas = parseCSV(csvText.trim());
    if (linhas.length < 2) {
      console.error("CSV vazio ou sem dados.");
      return;
    }

    const cabecalhos = linhas[0].map(col => removeAcentos(col.trim()));
    const dados = linhas.slice(1);

    const contratos = dados.map(colunas => {
      const obj = {};
      cabecalhos.forEach((coluna, idx) => {
        obj[coluna] = colunas[idx] || "";
      });
      return {
        nickname: obj.nickname,
        purchaseprice: obj.purchaseprice,
        date: obj.date,
        adress: obj.adress,
        status: obj.status,
        incentive: obj.incentive,
        financedprice: obj.financedprice,
        downpayment: obj.downpayment,
        financedamount: obj.financedamount,
        closingcosts: obj.closingcosts,
        acquisitionexpense: obj.acquisitionexpense,
        interestrateyear: obj.interestrateyear,
        terminyearloan: obj.terminyearloan,
        mortagepayment: obj.mortagepayment,
        linkpdf: obj.linkagreement,
        linkplanilha: obj.linksheet
      };
    });

    carregarContratos(contratos);
  })
  .catch(error => {
    console.error("Erro ao carregar CSV:", error);
  });

