db = db.getSiblingDB('Einbinden');

db.createCollection('Books');
db.createCollection('Sessions');
db.createCollection('Users');

// INDEXES
const books = db.getCollection('Books');
books.createIndex( { "isbn": 1 }, { unique: true } );
books.createIndex(
  { 'title': 1 },
  { name: 'regexSearchIndex' }
);
books.createIndex(
  {
    'title': 'text',
    'subtitle': 'text',
    'authors': 'text'
  }, {
    weights: {
      'title': 5,
      'subtitle': 2,
      'authors': 1
    },
    name: 'textBooksIndex'
  }
);