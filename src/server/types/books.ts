interface Book {
  isbn: string;
  title: string;
  subtitle: string | undefined;
  authors: Array<string>;
  publisher: string | undefined;
  publishedDate: string;
  cover: string | undefined;
  hasIsbn: boolean;
  userId: string | undefined;
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
