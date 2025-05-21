// netlify/functions/getHealthData.js
const { MongoClient } = require("mongodb");
let clientPromise = null;

const uri    = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "informa_cidadao";     // <- aqui

if (!uri) throw new Error("MONGODB_URI não está definido");

exports.handler = async (event) => {
  try {
    if (!clientPromise) {
      clientPromise = MongoClient.connect(uri);
    }
    const client = await clientPromise;
    const db     = client.db(dbName);                         // <- usar dbName
    const coll   = db.collection("saude");

    const { type, cidade } = event.queryStringParameters || {};
    if (!type || !cidade) {
      return { statusCode: 400, body: JSON.stringify({ error: "type e cidade são obrigatórios" }) };
    }

    // Continua como antes: traz o único doc-container
    const config = await coll.findOne({});
    if (!config || !Array.isArray(config[type])) {
      return { statusCode: 404, body: JSON.stringify({ error: `Seção '${type}' não encontrada` }) };
    }

    // Filtra pelo campo cidade dentro do array
    const items = config[type].filter(item => item.cidade === cidade);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(items),
    };
  } catch (err) {
    console.error("Erro em getHealthData:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
