// netlify/functions/postHealthData.js
const { MongoClient } = require("mongodb");

let clientPromise = null;
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "informa_cidadao";

if (!uri) throw new Error("MONGODB_URI não está definido");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    if (!clientPromise) {
      clientPromise = MongoClient.connect(uri);
    }
    const client = await clientPromise;
    const db = client.db(dbName);

    const { tipo, cidade, dados } = JSON.parse(event.body);
    if (!tipo || !cidade || !dados) {
      return { statusCode: 400, body: JSON.stringify({ error: "payload inválido" }) };
    }

    console.log(`Inserindo em saude:`, { tipo, cidade, dados });
    const result = await db.collection("saude").insertOne({ tipo, cidade, ...dados });

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ insertedId: result.insertedId }),
    };
  } catch (err) {
    console.error("Erro em postHealthData:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
