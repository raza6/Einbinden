interface Book {
  isbn: string;
  title: string;
  authors: Array<string>;
  publisher: string;
  publishedDate: string;
  cover: string;
  hasIsbn: boolean;
}

export type {
  Book
};
