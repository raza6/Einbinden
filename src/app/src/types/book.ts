interface Book {
  title: string;
  subtitle?: string;
  authors: string[];
  publisher?: string;
  publishedDate: Date;
  isbn: string;
  cover: string;
  tags: string[];
}

interface BookSearchResponse {
  books: Array<Book>;
  count: number;
}

interface BookAddError {
  error: 'INVALID_ISBN' | 'ALREADY_IN_COLLECTION' | 'FETCH_ERROR';
  description: string;
}

export type { Book, BookSearchResponse, BookAddError };