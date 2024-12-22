import MongoDB from "../mongo/mongo";
import { Book, BookSearchResponse } from "../types/books";
import { parseISBN } from "../utils/isbn";
import externalBooksService from "./externalBooksService";

export default class bookService {
  public static async addBookViaIsbn(isbn: string, userId: string): Promise<Book | null> {
    try {
      const isbnParsed = parseISBN(isbn);
      const mongo = new MongoDB();
      if (await mongo.checkBook(isbn, userId)) {
        console.log(`🧨 Book already present (ISBN : ${isbn})`);
        return null;
      } else {
        const book = await externalBooksService.getByISBN(isbnParsed);
        book.userId = userId;
        await mongo.addBook(book);
        return book;
      }
    } catch (error) {
      console.log(`🧨 Book not added, reason : ${(<Error>error).message}`);
      return null;
    }
  }

  public static async editBook(isbn: string, book: Book, userId: string): Promise<boolean> {
    try {
      const mongo = new MongoDB();
      if (book.userId === userId && await mongo.checkBook(isbn, userId)) {
        await mongo.editBook(book, userId);
        return true;
      } else {
        console.log(`🧨 Book not present (ISBN : ${isbn})`);
        return false;
      }
    } catch (error) {
      console.log(`🧨 Book not edited, reason : ${(<Error>error).message}`);
      return false;
    }
  }

  public static async getBook(isbn: string, userId: string): Promise<Book | null> {
    if (isbn) {
      try {
        const mongo = new MongoDB();
        return await mongo.getBook(isbn, userId);
      } catch (err: unknown) {
        console.log(`🧨 Book not retrieved (ISBN : ${isbn}), reason : ${err}`);
        return null;
      }
    } else {
      console.log('🧨 Book not retrieved, reason : ISBN is empty');
    }
    return null;
  }

  public static async deleteBook(isbn: string, userId: string): Promise<boolean> {
    if (isbn) {
      try {
        const mongo = new MongoDB();
        await mongo.deleteBook(isbn, userId);
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
    userId: string
  ): Promise<BookSearchResponse> {
    try {
      const mongo = new MongoDB();
      return await mongo.searchBook(term.trim(), pageIndex, pageSize, userId);
    } catch (err: unknown) {
      return {
        books: [],
        count: 0,
      };
    }
  }
}
