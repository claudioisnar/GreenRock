let todosContratos = [];

/**
 * parseCSV(textoCSV):
 *   Converte o texto completo de um CSV em um array de linhas,
 *   onde cada linha é um array de campos. Respeita aspas para valores
 *   que contenham vírgulas internas.
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
        // Possível fim de aspas ou aspas escapada ("")
        if (i + 1 < chars.length && chars[i + 1] === '"') {
          campo += '"';
          i += 2;
        } else {
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
        while (i < chars.length && (chars[i] === '\r' || chars[i] === '\n')) {
          i++;
        }
        break;
      }
      else {
        campo += c;
        i++;
      }
    }

    // Se chegou ao fim do texto sem quebra de linha, ainda há um campo
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
 * removeAcentosENormaliza(str):
 *   Remove acentos e caracteres especiais, deixando apenas letras e números em minúsculo.
 *   Por exemplo: "Nick Name" → "nickname", "Purchase Price" → "purchaseprice".
 */
function removeAcentosENormaliza(str) {
  return str
    .normalize("NFD")               // separa letras de seus diacríticos
    .replace(/[\u0300-\u036f]/g, "")// remove os diacríticos
    .replace(/[^a-zA-Z0-9]/g, "")   // remove tudo que não for letra/número
    .toLowerCase();                 // converte para minúsculo
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

  // Armazena localmente para uso no detalhamento
  todosContratos = lista;
}

function verDetalhes(index) {
  const contrato = todosContratos[index];

  // Preenche cada campo de detalhe com o valor correto
  document.getElementById("det-nickname").textContent       = contrato.nickname       || "-";
  document.getElementById("det-purchaseprice").textContent  = contrato.purchaseprice  || "-";
  document.getElementById("det-date").textContent           = contrato.date           || "-";
  document.getElementById("det-adress").textContent         = contrato.adress         || "-";
  document.getElementById("det-status").textContent         = contrato.status         || "-";

  // Campos extras (caso existam na planilha)
  document.getElementById("det-incentive").textContent         = contrato.incentive         || "-";
  document.getElementById("det-financedprice").textContent     = contrato.financedprice     || "-";
  document.getElementById("det-downpayment").textContent       = contrato.downpayment       || "-";
  document.getElementById("det-financedamount").textContent    = contrato.financedamount    || "-";
  document.getElementById("det-closingcosts").textContent      = contrato.closingcosts      || "-";
  document.getElementById("det-acquisitionexpense").textContent= contrato.acquisitionexpense|| "-";
  document.getElementById("det-interestrateyear").textContent   = contrato.interestrateyear  || "-";
  document.getElementById("det-terminyearloan").textContent     = contrato.terminyearloan    || "-";
  document.getElementById("det-mortagepayment").textContent     = contrato.mortagepayment    || "-";

  // Ajusta os links para abrir a planilha e o PDF
  document.getElementById("link-planilha").href = contrato.linksheet     || "#";
  document.getElementById("link-pdf").href       = contrato.linkagreement || "#";

  document.getElementById("detalhes").classList.remove("hidden");
}

function fecharDetalhes() {
  document.getElementById("detalhes").classList.add("hidden");
}

// *****************************************
// Se não quiser filtro, remova o listener abaixo:
document.getElementById("filtro").addEventListener("input", e => {
  const termo = e.target.value.toLowerCase().trim();
  if (!termo) {
    carregarContratos(todosContratos);
    return;
  }
  const filtrados = todosContratos.filter(c =>
    (c.nickname       || "").toLowerCase().includes(termo) ||
    (c.purchaseprice  || "").toLowerCase().includes(termo) ||
    (c.date           || "").toLowerCase().includes(termo) ||
    (c.adress         || "").toLowerCase().includes(termo) ||
    (c.status         || "").toLowerCase().includes(termo)
  );
  carregarContratos(filtrados);
});

// URL pública do CSV (publicada em "Arquivo → Compartilhar → Publicar na web → CSV")
const URL_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT4-Byvx6MozOO0BkbOT4V60ekea-cr0Cywf_8wvHSEno2RUW8luLJG3C5RpSjKZK8tZx8GFaXtjVhg/pub?gid=0&single=true&output=csv";

fetch(URL_CSV)
  .then(response => response.text())
  .then(csvText => {
    const linhas = parseCSV(csvText.trim());

    if (linhas.length < 2) {
      console.error("CSV parece vazio ou não contém dados");
      return;
    }

    // A primeira linha do CSV é o cabeçalho original
    // Exemplo: ["Nick Name","Purchase Price","Link Agreement","Link Sheet","Date","Adress","Status","Incentive", ...]
    const cabecalhos = linhas[0].map(col =>
      removeAcentosENormaliza(col.trim())
    );
    const dadosLinhas = linhas.slice(1);

    // Monta array de objetos mapeando cada coluna pelo seu cabeçalho normalizado
    const contratos = dadosLinhas.map(fields => {
      const obj = {};
      cabecalhos.forEach((chave, idx) => {
        obj[chave] = fields[idx] || "";
      });
      // Retorna apenas os campos usados no front-end
      return {
        nickname:           obj.nickname,
        purchaseprice:      obj.purchaseprice,
        date:               obj.date,
        adress:             obj.adress,
        status:             obj.status,
        incentive:          obj.incentive,
        financedprice:      obj.financedprice,
        downpayment:        obj.downpayment,
        financedamount:     obj.financedamount,
        closingcosts:       obj.closingcosts,
        acquisitionexpense: obj.acquisitionexpense,
        interestrateyear:   obj.interestrateyear,
        terminyearloan:     obj.terminyearloan,
        mortagepayment:     obj.mortagepayment,
        linkagreement:      obj.linkagreement,
        linksheet:          obj.linksheet
      };
    });

    carregarContratos(contratos);
  })
  .catch(error => {
    console.error("Erro ao carregar CSV:", error);
  });
