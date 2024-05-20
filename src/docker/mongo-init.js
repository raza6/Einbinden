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
books.createIndex( { "isbn": 1 }, { unique: true } );
books.createIndex(
  { 'title': 1 },
  { name: 'regexSearchIndex' }
);
books.createIndex(
  {
    'title': 'text',
    'subtitle': 'text'
  }, {
    weights: {
      'title': 3,
      'subtitle': 1
    },
    name: 'textBooksIndex'
  }
);