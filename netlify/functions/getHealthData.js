// netlify/functions/getHealthData.js
const { MongoClient } = require("mongodb");

let clientPromise;
const uri = process.env.MONGODB_URI;

if (!uri) throw new Error("MONGODB_URI não está definido");

clientPromise = MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

exports.handler = async (event) => {
  const { type, cidade } = event.queryStringParameters || {};
  if (!type || !cidade) {
    return { statusCode: 400, body: JSON.stringify({ error: "type e cidade são obrigatórios" }) };
  }

  try {
    const client = await clientPromise;
    const db = client.db("informa_cidadao");
    const collection = db.collection("saude");

    const data = await collection
      .find({ cidade, tipo: type })
      .toArray();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  }
};
