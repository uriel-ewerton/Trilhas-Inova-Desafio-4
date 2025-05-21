// netlify/functions/getHealthData.js
const { MongoClient } = require("mongodb");
let cachedClient = null;

// Configuração da conexão MongoDB
const uri = process.env.MONGODB_URI;
const dbName = "dev-informa-cidadao-aws"; // Nome do banco explícito

exports.handler = async (event, context) => {
  // Permite manter a conexão aberta entre invocações
  context.callbackWaitsForEmptyEventLoop = false;

  // Log para debug
  console.log("Função getHealthData iniciada");
  console.log("URI MongoDB configurada:", uri ? "Sim" : "Não");

  // Verifica parâmetros da requisição
  const { type, cidade } = event.queryStringParameters || {};
  if (!type || !cidade) {
    console.log("Parâmetros inválidos:", { type, cidade });
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ error: "type e cidade são obrigatórios" }),
    };
  }

  try {
    // Verifica se a URI está configurada
    if (!uri) {
      console.error("MONGODB_URI não está definida no ambiente");
      throw new Error("Configuração de banco de dados ausente");
    }

    // Conecta ao MongoDB se ainda não estiver conectado
    if (!cachedClient) {
      console.log("Iniciando nova conexão com MongoDB");
      cachedClient = await MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        connectTimeoutMS: 10000,
        serverSelectionTimeoutMS: 10000,
      });
      console.log("Conexão com MongoDB estabelecida");
    }

    // Acessa o banco de dados e a coleção
    const db = cachedClient.db(dbName);
    const coll = db.collection("saude");
    console.log("Acessando coleção 'saude'");

    // Busca documento com base no tipo e cidade
    const query = {};
    query[`${type}.cidade`] = cidade;
    
    console.log("Executando consulta:", JSON.stringify(query));
    const config = await coll.findOne(query);
    
    // Verifica se encontrou dados
    if (!config || !config[type]) {
      console.log("Nenhum dado encontrado para", type, "em", cidade);
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({ error: `Dados para '${type}' em '${cidade}' não encontrados.` }),
      };
    }

    // Filtra itens pela cidade
    const items = Array.isArray(config[type]) 
      ? config[type].filter(item => item.cidade === cidade)
      : [];
    
    console.log(`Encontrados ${items.length} itens para ${type} em ${cidade}`);

    // Retorna os dados encontrados
    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(items),
    };

  } catch (err) {
    // Log detalhado do erro
    console.error("Erro em getHealthData:", err);
    console.error("Stack trace:", err.stack);
    
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ 
        error: "Erro ao acessar o banco de dados",
        details: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      }),
    };
  }
};
