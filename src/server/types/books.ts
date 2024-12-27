interface BookBase {
  isbn: string;
  title: string;
  subtitle: string | undefined;
  authors: Array<string>;
  publisher: string | undefined;
  publishedDate: string;
  cover: string | undefined;
  hasIsbn: boolean;
}

interface Book extends BookBase {
  userId: string;
  addedAtCollectionTime: Date;
  tags: Array<string>;
  // lend: LendData | undefined;
}

interface LendData {
  to: string;
  date: Date;
}

interface BookSearchResponse {
  books: Array<BookBase>;
  count: number;
}

interface BookRequest {
  searchTerm: string;
  pageSize: number;
  pageIndex: number;
}

export type {
  BookBase,
  Book,
  BookRequest,
  BookSearchResponse
};
