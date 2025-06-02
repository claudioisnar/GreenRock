let todosContratos = [];

/**
 * Função que parseia um texto CSV (respeitando aspas) e retorna um array de linhas,
 * onde cada linha é um array de valores. Exemplo:
 *   parseCSV('"A,B",123,"C""D",E')  →  [ [ "A,B", "123", 'C"D', "E" ] ]
 */
function parseCSV(textoCSV) {
  const linhas = [];
  const chars = textoCSV.split('');
  let i = 0;

  while (i < chars.length) {
    const linha = [];
    let campo = '';
    let dentroAspas = false;

    // Percorre até o fim da linha
    while (i < chars.length) {
      const c = chars[i];

      if (c === '"' && !dentroAspas) {
        // Início de um valor entre aspas
        dentroAspas = true;
        i++;
      }
      else if (c === '"' && dentroAspas) {
        // Pode ser fim de aspas ou aspas escapada
        if (i + 1 < chars.length && chars[i + 1] === '"') {
          // aspas escapada: adiciona uma " e pula 1 caractere
          campo += '"';
          i += 2;
        } else {
          // fim do trecho entre aspas
          dentroAspas = false;
          i++;
        }
      }
      else if (c === ',' && !dentroAspas) {
        // vírgula fora de aspas: separador de campo
        linha.push(campo);
        campo = '';
        i++;
      }
      else if ((c === '\r' || c === '\n') && !dentroAspas) {
        // fim da linha (pode ser \r\n ou só \n ou só \r)
        linha.push(campo);
        campo = '';
        // pular todos \r ou \n seguidos
        while (i < chars.length && (chars[i] === '\r' || chars[i] === '\n')) {
          i++;
        }
        break;
      }
      else {
        // caractere qualquer (dentro ou fora de aspas)
        campo += c;
        i++;
      }
    }

    // se chegamos ao fim do texto sem encontrar \n, ainda sobra campo
    if (campo !== '' || chars[i - 1] === ',') {
      linha.push(campo);
    }

    // ignora linhas em branco vazias (sem valor algum)
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

// 👉 URL pública do CSV da aba "Contratos", gerada em "Publicar na web"
const URL_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT4-Byvx6MozOO0BkbOT4V60ekea-cr0Cywf_8wvHSEno2RUW8luLJG3C5RpSjKZK8tZx8GFaXtjVhg/pub?gid=0&single=true&output=csv";

fetch(URL_CSV)
  .then(response => response.text())
  .then(csvText => {
    // Primeiro passo: quebrar em linhas e colunas com nosso parser
    const linhas = parseCSV(csvText.trim());

    if (linhas.length < 2) {
      console.error("CSV parece vazio ou não contém dados");
      return;
    }

    // A primeira linha é o cabeçalho real:
    //   ["Apelido", "Valor", "Link PDF", "Link Planilha", "Data", "Endereço", "Status"]
    const cabeçalhoOriginal = linhas[0].map(col =>
      col.trim().toLowerCase().replace(/\s/g, '')
    );
    // Exemplo de cabeçalhoOriginal: ["apelido","valor","linkpdf","linkplanilha","data","endereco","status"]

    // As demais linhas são os dados:
    const dadosLinhas = linhas.slice(1);

    // Montar array de objetos, mapeando por nome de coluna, não por índice fixo
    const contratos = dadosLinhas.map(colunas => {
      const obj = {};
      cabeçalhoOriginal.forEach((chave, idx) => {
        // “colunas[idx]” já está sem aspas externas (parser trata isso)
        obj[chave] = colunas[idx] || "";
      });
      // Retornar exatamente os campos que vamos usar
      return {
        apelido: obj.apelido,
        valor: obj.valor,
        data: obj.data,
        endereco: obj.endereco,
        status: obj.status,
        linkpdf: obj.linkpdf,
        linkplanilha: obj.linkplanilha
      };
    });

    carregarContratos(contratos);
  })
  .catch(error => {
    console.error("Erro ao carregar CSV:", error);
  });
