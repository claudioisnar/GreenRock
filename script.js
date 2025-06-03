let todosContratos = [];

/**
 * parseCSV(textoCSV):
 *   Recebe todo o conteúdo de um CSV (como string) e retorna um array de linhas,
 *   onde cada linha é um array de campos. Respeita aspas para valores com vírgulas internas.
 */
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
        // Início de valor entre aspas
        dentroAspas = true;
        i++;
      }
      else if (c === '"' && dentroAspas) {
        // Possível fim de aspas ou aspas escapada
        if (i + 1 < chars.length && chars[i + 1] === '"') {
          // Aspas escapada: adiciona uma " no campo e pula 1 posição
          campo += '"';
          i += 2;
        } else {
          // Fim do trecho entre aspas
          dentroAspas = false;
          i++;
        }
      }
      else if (c === ',' && !dentroAspas) {
        // Vírgula fora de aspas: separador de campo
        linha.push(campo);
        campo = '';
        i++;
      }
      else if ((c === '\r' || c === '\n') && !dentroAspas) {
        // Fim de linha (\r, \n ou \r\n)
        linha.push(campo);
        campo = '';
        // Pular todos os \r ou \n
        while (i < chars.length && (chars[i] === '\r' || chars[i] === '\n')) {
          i++;
        }
        break;
      }
      else {
        // Qualquer outro caractere (dentro ou fora de aspas)
        campo += c;
        i++;
      }
    }

    // Se chegou ao fim do CSV sem quebra de linha, ainda resta um campo
    if (campo !== '' || chars[i - 1] === ',') {
      linha.push(campo);
    }

    // Ignora linhas totalmente vazias
    const todosVazios = linha.every(val => val === '');
    if (!todosVazios) {
      linhas.push(linha);
    }
  }

  return linhas;
}

/**
 * removeAcentos(str):
 *   Recebe uma string e retorna sem acentos (NFD + remoção de diacríticos).
 *   Também converte tudo para minúsculo.
 */
function removeAcentos(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function carregarContratos(lista) {
  const tbody = document.querySelector("#tabela-contratos tbody");
  tbody.innerHTML = ""; // limpa tabela antes de preencher

  lista.forEach((contrato, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${contrato.nickname || "-"}</td>
      <td>${contrato.purchaseprice || "-"}</td>
      <td>${contrato.date || "-"}</td>
      <td>${contrato.adress || "-"}</td>
      <td>${contrato.status || "-"}</td>
      <td><button onclick="verDetalhes(${index})">Ver Detalhes</button></td>
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

// ─────────────────────────────────────────────────────────────────────────────
// ► URL pública do CSV da aba "Contratos" (publicada em "Publicar na web → CSV")
const URL_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT4-Byvx6MozOO0BkbOT4V60ekea-cr0Cywf_8wvHSEno2RUW8luLJG3C5RpSjKZK8tZx8GFaXtjVhg/pub?gid=0&single=true&output=csv";

fetch(URL_CSV)
  .then(response => response.text())
  .then(csvText => {
    // 1) Quebrar em linhas/colunas, respeitando aspas
    const linhas = parseCSV(csvText.trim());
    if (linhas.length < 2) {
      console.error("CSV vazio ou sem dados.");
      return;
    }

    // 2) A primeira linha do CSV é o cabeçalho original:
    //    ["Nick Name","Purchase Price","Link PDF","Link Planilha","Date","Adress","Status","Incentive", ... etc ]
    const cabeçalhosOriginais = linhas[0].map(col =>
      // remove acentos e converte para minúsculo, depois apaga todos os caracteres que não sejam letra ou número
      removeAcentos(col.trim()).replace(/[^a-z0-9]/g, '')
    );
    // Exemplo resultante: ["nickname","purchaseprice","linkpdf","linkplanilha","date","adress","status","incentive","financedprice", ...]

    // 3) As linhas seguintes contêm os dados
    const linhasDados = linhas.slice(1);

    // 4) Montar array de objetos, mapeando por nome de coluna
    const contratos = linhasDados.map(fields => {
      const obj = {};
      cabeçalhosOriginais.forEach((coluna, idx) => {
        obj[coluna] = fields[idx] || "";
      });
      // Retornar apenas os campos que vamos usar:
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
        linkpdf: obj.linkpdf,
        linkplanilha: obj.linkplanilha
      };
    });

    carregarContratos(contratos);
  })
  .catch(error => {
    console.error("Erro ao carregar CSV:", error);
  });
