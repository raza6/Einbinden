interface Book {
  isbn: string;
  title: string;
  subtitle: string | null;
  authors: Array<string>;
  publisher: string;
  publishedDate: string;
  cover: string;
  hasIsbn: boolean;
}

interface BookSearchResponse {
  books: Array<Book>;
  count: number;
}

interface BookRequest {
  searchTerm: string;
  pageSize: number;
  pageIndex: number;
}

export type {
  Book,
  BookRequest,
  BookSearchResponse
};
