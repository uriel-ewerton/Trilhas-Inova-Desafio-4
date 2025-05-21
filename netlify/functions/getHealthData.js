// netlify/functions/getHealthData.js
const { MongoClient } = require("mongodb");
let cachedClient = null;

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI não está definido");

exports.handler = async (event, context) => {
  // permite manter a conexão aberta entre invocações
  context.callbackWaitsForEmptyEventLoop = false;

  const { type, cidade } = event.queryStringParameters || {};
  if (!type || !cidade) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "type e cidade são obrigatórios" }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // Permite CORS
      }
    };
  }

  try {
    if (!cachedClient) {
      // Conecta usando URI que já inclui o nome do DB    
      cachedClient = await MongoClient.connect(uri, {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
      });
    }
    // db() sem argumento usa o database que está na URI
    const db = cachedClient.db();
    const coll = db.collection("saude");

    // Busca o único documento container
    const config = await coll.findOne({});
    if (!config || !Array.isArray(config[type])) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: `Seção '${type}' não encontrada.` }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" // Permite CORS
        }
      };
    }

    // Agora filtra o array interno por item.cidade
    const items = config[type].filter(item => item.cidade === cidade);

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // Permite CORS
      },
      body: JSON.stringify(items),
    };

  } catch (err) {
    console.error("Erro em getHealthData:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // Permite CORS
      }
    };
  }
};
