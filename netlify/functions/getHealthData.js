// netlify/functions/getHealthData.js
const { MongoClient } = require("mongodb");
let cachedClient = null;

// Configuração da conexão MongoDB
const uri = process.env.MONGODB_URI;
const dbName = "informa_cidadao"; // Nome correto do banco de dados

exports.handler = async (event, context) => {
  // Permite manter a conexão aberta entre invocações
  context.callbackWaitsForEmptyEventLoop = false;

  // Verifica parâmetros da requisição
  const { type, cidade } = event.queryStringParameters || {};
  if (!type || !cidade) {
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
      throw new Error("MONGODB_URI não está definida no ambiente");
    }

    // Conecta ao MongoDB se ainda não estiver conectado
    if (!cachedClient) {
      cachedClient = await MongoClient.connect(uri, {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
      });
    }

    // Acessa o banco de dados e a coleção
    const db = cachedClient.db(dbName);
    const coll = db.collection("saude");

    // Busca o documento na coleção saude
    const doc = await coll.findOne({});
    
    // Verifica se encontrou o documento e se ele tem o tipo solicitado
    if (!doc || !Array.isArray(doc[type])) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({ error: `Seção '${type}' não encontrada.` }),
      };
    }

    // Filtra os itens do tipo pela cidade
    const items = doc[type].filter(item => item.cidade === cidade);

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
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ 
        error: "Erro ao acessar o banco de dados",
        message: err.message
      }),
    };
  }
};
