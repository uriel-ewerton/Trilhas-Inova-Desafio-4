// netlify/functions/testMongoDB.js
const { MongoClient } = require("mongodb");

exports.handler = async (event, context) => {
  // Permite manter a conexão aberta entre invocações
  context.callbackWaitsForEmptyEventLoop = false;

  // Configuração da conexão MongoDB
  const uri = process.env.MONGODB_URI;
  const dbName = "dev-informa-cidadao-aws";

  // Logs para debug
  console.log("Função testMongoDB iniciada");
  console.log("URI MongoDB configurada:", uri ? "Sim (primeiros 15 caracteres: " + uri.substring(0, 15) + "...)" : "Não");

  try {
    // Verifica se a URI está configurada
    if (!uri) {
      console.error("MONGODB_URI não está definida no ambiente");
      throw new Error("Configuração de banco de dados ausente");
    }

    // Tenta conectar ao MongoDB
    console.log("Iniciando conexão com MongoDB");
    const client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
    });
    console.log("Conexão com MongoDB estabelecida");

    // Tenta acessar o banco de dados
    const db = client.db(dbName);
    console.log("Banco de dados acessado:", dbName);

    // Lista as coleções disponíveis
    const collections = await db.listCollections().toArray();
    console.log("Coleções disponíveis:", collections.map(c => c.name));

    // Verifica se a coleção 'saude' existe
    const saudeExists = collections.some(c => c.name === 'saude');
    
    // Se existir, tenta buscar um documento
    let sampleDoc = null;
    if (saudeExists) {
      sampleDoc = await db.collection('saude').findOne({});
      console.log("Documento de exemplo encontrado:", sampleDoc ? "Sim" : "Não");
    }

    // Fecha a conexão
    await client.close();
    console.log("Conexão fechada");

    // Retorna os resultados do teste
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        success: true,
        message: "Teste de conexão MongoDB concluído",
        details: {
          dbConnected: true,
          dbName: dbName,
          collections: collections.map(c => c.name),
          saudeCollectionExists: saudeExists,
          sampleDocumentFound: !!sampleDoc,
          sampleDocumentKeys: sampleDoc ? Object.keys(sampleDoc) : null
        }
      }),
    };

  } catch (err) {
    // Log detalhado do erro
    console.error("Erro em testMongoDB:", err);
    console.error("Stack trace:", err.stack);
    
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ 
        success: false,
        error: "Erro ao testar conexão com MongoDB",
        details: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      }),
    };
  }
};
