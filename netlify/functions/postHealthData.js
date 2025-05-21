// netlify/functions/postHealthData.js
const { MongoClient } = require("mongodb");

let clientPromise;
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI não está definido");

clientPromise = MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const client = await clientPromise;
    const db = client.db("informa_cidadao");
    const collection = db.collection("saude");

    const payload = JSON.parse(event.body);
    // payload deve ter: { cidade, tipo, dados: { nome, horario, documentos, telefone, endereco, ... } }
    const doc = {
      cidade: payload.cidade,
      tipo: payload.tipo,
      ...payload.dados,
    };

    const res = await collection.insertOne(doc);

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ insertedId: res.insertedId }),
    };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  }
};
