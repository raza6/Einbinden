interface Book {
  title: string;
  subtitle?: string;
  authors: string[];
  publisher?: string;
  publishedDate: Date;
  isbn: string;
  cover: string;
}

interface BookSearchResponse {
  books: Array<Book>;
  count: number;
}

export type { Book, BookSearchResponse };