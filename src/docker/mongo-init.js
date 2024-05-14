db = db.getSiblingDB('Einbinden');

db.createCollection('Books');
db.createCollection('Sessions');
db.createCollection('Users');

// INDEXES

const users = db.getCollection("Users");
users.createIndex(
  { "lastConnection": 1 }, 
  { expireAfterSeconds: 31536000, name: 'userTTLIndex' }
);

const books = db.getCollection('Books');
books.createIndex(
  {
    'title': 'text',
  }, {
    weights: {
      'title': 1,
    },
    name: 'textBooksIndex'
  }
);