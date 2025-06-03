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
      <td><button onclick="verDetalhes(${index})">Detail</button></td>
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
  const termo = e.target.value.toLowerCase().trim();
  if (!termo) {
    carregarContratos(todosContratos);
    return;
  }
  const filtrados = todosContratos.filter(c =>
    (c.apelido || "").toLowerCase().includes(termo) ||
    (c.valor || "").toLowerCase().includes(termo) ||
    (c.data || "").toLowerCase().includes(termo) ||
    (c.endereco || "").toLowerCase().includes(termo) ||
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
      console.error("CSV parece vazio ou não contém dados");
      return;
    }

    const cabecalhoOriginal = linhas[0].map(col =>
      col.trim().toLowerCase().replace(/\s/g, '')
    );

    const dadosLinhas = linhas.slice(1);

    const contratos = dadosLinhas.map(colunas => {
      const obj = {};
      cabecalhoOriginal.forEach((chave, idx) => {
        obj[chave] = colunas[idx] || "";
      });
      return {
        apelido: obj.apelido,
        valor: obj.valor,
        data: obj.data,
        endereco: obj.adress || obj.endereco || "",
        status: obj.status,
        linkpdf: obj.linkagreement,
        linkplanilha: obj.linksheet
      };
    });

    carregarContratos(contratos);
  })
  .catch(error => {
    console.error("Erro ao carregar CSV:", error);
  });
