// netlify/functions/getHealthData.js
const { MongoClient } = require("mongodb");
let cachedClient = null;

const uri    = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "informa_cidadao";

if (!uri) {
  throw new Error("MONGODB_URI não está definido");
}

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    // Reaproveita conexão entre invocações
    if (!cachedClient) {
      cachedClient = await MongoClient.connect(uri, {
        // timeout de 5s para não apostar 10s inteiro
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
      });
    }
    const db   = cachedClient.db(dbName);
    const coll = db.collection("saude");

    const { type, cidade } = event.queryStringParameters || {};
    if (!type || !cidade) {
      return { statusCode: 400, body: JSON.stringify({ error: "type e cidade são obrigatórios" }) };
    }

    // Puxa apenas o documento da cidade (caso você tenha migrate para container por cidade)
    const config = await coll.findOne({ cidade }, { projection: { [type]: 1, _id: 0 } });
    if (!config || !Array.isArray(config[type])) {
      return { statusCode: 404, body: JSON.stringify({ error: `Seção '${type}' não encontrada para ${cidade}` }) };
    }

    // Retorna diretamente o array (já isolado por cidade)
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config[type]),
    };

  } catch (err) {
    console.error("Erro na getHealthData:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
