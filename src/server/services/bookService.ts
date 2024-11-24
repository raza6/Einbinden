import MongoDB from "../mongo/mongo";
import { Book, BookSearchResponse } from "../types/books";
import { parseISBN } from "../utils/isbn";
import externalBooksService from "./externalBooksService";

export default class bookService {
  public static async addBookViaIsbn(isbn: string): Promise<Book | null> {
    try {
      const isbnParsed = parseISBN(isbn);
      const mongo = new MongoDB();
      if (await mongo.checkBook(isbn)) {
        console.log(`🧨 Book already present (ISBN : ${isbn})`);
        return null;
      } else {
        const book = await externalBooksService.getByISBN(isbnParsed);
        await mongo.addBook(book);
        return book;
      }
    } catch (error) {
      console.log(`🧨 Book not added, reason : ${(<Error>error).message}`);
      return null;
    }
  }

  public static async deleteBook(isbn: string): Promise<boolean> {
    if (isbn) {
      try {
        const mongo = new MongoDB();
        await mongo.deleteBook(isbn);
        return true;
      } catch (err: unknown) {
        console.log(`🧨 Book not deleted (ISBN : ${isbn}), reason : ${err}`);
        return false;
      }
    } else {
      console.log('🧨 Book not deleted, reason : ISBN is empty');
    }
    return false;
  }

  public static async searchBook(
    term: string,
    pageIndex: number,
    pageSize: number,
  ): Promise<BookSearchResponse> {
    try {
      const mongo = new MongoDB();
      return await mongo.searchBook(term.trim(), pageIndex, pageSize);
    } catch (err: unknown) {
      return {
        books: [],
        count: 0,
      };
    }
  }
}
