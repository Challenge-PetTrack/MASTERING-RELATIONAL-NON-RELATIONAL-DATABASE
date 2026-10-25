// Executar com mongosh conectado a mongodb://127.0.0.1:27017/pettrack_sprint4.
// Reexecutavel: upsert pelo ID relacional, sem apagar dados ou colecoes.
const fs = require('fs');
const path = require('path');
const arquivo = process.env.PETTRACK_DATASET || path.resolve('sprint4/dataset/pets.json');
const documentos = JSON.parse(fs.readFileSync(arquivo, 'utf8').replace(/^\uFEFF/, ''));
if (!Array.isArray(documentos) || documentos.length === 0) {
  throw new Error('O dataset precisa conter pets exportados do Oracle.');
}
const ids = new Set();
for (const pet of documentos) {
  if (!Number.isSafeInteger(pet.idPet) || pet.idPet <= 0 || ids.has(pet.idPet) ||
      typeof pet.nome !== 'string' || !pet.nome || typeof pet.especie !== 'string' ||
      typeof pet.raca !== 'string' ||
      !(pet.pesoKg === null || (typeof pet.pesoKg === 'number' && pet.pesoKg > 0)) ||
      !pet.tutor || !Number.isSafeInteger(pet.tutor.id) || pet.tutor.id <= 0 ||
      typeof pet.tutor.nome !== 'string' || !pet.clinica ||
      !Number.isSafeInteger(pet.clinica.id) || pet.clinica.id <= 0 ||
      typeof pet.clinica.nome !== 'string' || pet.erro || '_id' in pet) {
    throw new Error(`Documento invalido ou ID duplicado: ${pet.idPet}`);
  }
  ids.add(pet.idPet);
}
const destino = db.getSiblingDB('pettrack_sprint4');
const numero = ['int', 'long', 'double', 'decimal'];
const entidade = { bsonType: 'object', required: ['id', 'nome'], properties: {
  id: { bsonType: numero, minimum: 1 }, nome: { bsonType: 'string' }
}};
const validator = { $jsonSchema: {
  bsonType: 'object', required: ['idPet', 'nome', 'especie', 'raca', 'pesoKg', 'tutor', 'clinica'],
  properties: {
    idPet: { bsonType: numero, minimum: 1 }, nome: { bsonType: 'string' },
    especie: { bsonType: 'string' }, raca: { bsonType: 'string' },
    pesoKg: { bsonType: [...numero, 'null'], minimum: 0 }, tutor: entidade, clinica: entidade
  }
}};
if (!destino.getCollectionNames().includes('pets')) {
  destino.createCollection('pets', { validator });
}
destino.pets.createIndex({ idPet: 1 }, { unique: true, name: 'id_pet_oracle' });
destino.pets.createIndex({ 'tutor.id': 1 }, { name: 'pets_por_tutor' });
destino.pets.createIndex({ 'clinica.id': 1 }, { name: 'pets_por_clinica' });
const resultado = destino.pets.bulkWrite(documentos.map(pet => ({ updateOne: {
  filter: { _id: pet.idPet }, update: { $set: pet }, upsert: true
}})), { ordered: true });
for (const pet of documentos) {
  const importado = destino.pets.findOne({ _id: pet.idPet });
  for (const campo of Object.keys(pet)) {
    if (JSON.stringify(importado[campo]) !== JSON.stringify(pet[campo])) {
      throw new Error(`Divergencia no pet ${pet.idPet}, campo ${campo}.`);
    }
  }
}
printjson({ dataset: documentos.length, documentosConferidos: documentos.length,
  totalColecao: destino.pets.countDocuments(), novos: resultado.upsertedCount,
  atualizados: resultado.modifiedCount });
print('Consulta por tutor:');
printjson(destino.pets.find({ 'tutor.id': documentos[0].tutor.id },
  { _id: 0, idPet: 1, nome: 1, tutor: 1 }).toArray());
print('Quantidade de pets por clinica:');
printjson(destino.pets.aggregate([
  { $group: { _id: '$clinica.id', clinica: { $first: '$clinica.nome' }, pets: { $sum: 1 } } },
  { $sort: { _id: 1 } }
]).toArray());
