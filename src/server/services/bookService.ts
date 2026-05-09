import axios from "axios";
import MongoDB from "../mongo/mongo";
import { Book, BookAddError, BookSearchResponse } from "../types/books";
import { parseISBN, ISBNParseError } from "../utils/isbn";
import { BookFetchError } from "../utils/utils";
import { saveCoverToStatic } from "../utils/image";
import externalBooksService from "./externalBooksService";

export default class bookService {
  public static async addBookViaIsbn(isbn: string, userId: string): Promise<Book | BookAddError> {
    try {
      const isbnParsed = parseISBN(isbn);
      const mongo = new MongoDB();
      const existing = await mongo.getBook(isbnParsed, userId);
      if (existing) {
        console.log(`🧨 Book already present (ISBN : ${isbnParsed})`);
        return { error: 'ALREADY_IN_COLLECTION', description: `"${existing.title}" (${isbnParsed}) is already in your collection` };
      }
      const bookBase = await externalBooksService.getByISBN(isbnParsed);
      if (bookBase.cover && !bookBase.cover.includes('inventaire.io')) {
        bookBase.cover = await bookService.downloadCover(bookBase.cover, isbnParsed) ?? undefined;
      }
      const book = {
        ...bookBase,
        userId,
        addedAtCollectionTime: new Date(),
        tags: [],
        // lend: undefined,
      };
      await mongo.addBook({ ...book }); // Prevent mongo from mutating book var with _id
      return book;
    } catch (error) {
      console.log(`🧨 Book not added, reason : ${(<Error>error).message}`);
      if (error instanceof ISBNParseError) {
        return { error: 'INVALID_ISBN', description: `"${isbn}" is not a valid ISBN` };
      } else if (error instanceof BookFetchError) {
        return { error: 'FETCH_ERROR', description: `Failed to fetch book data from ${
          error.services.map(s => `${s.name}${s.statusCode !== undefined ? ` (${s.statusCode})` : ''}`).join(', ')
        }` };
      } else {
        return { error: 'FETCH_ERROR', description: (<Error>error).message };
      }
    }
  }

  public static async addBookRaw(bookData: Book, userId: string): Promise<Book | BookAddError> {
    try {
      const isbnParsed = parseISBN(bookData.isbn);
      const mongo = new MongoDB();
      const existing = await mongo.getBook(isbnParsed, userId);
      if (existing) {
        console.log(`🧨 Book already present (ISBN : ${isbnParsed})`);
        return { error: 'ALREADY_IN_COLLECTION', description: `"${existing.title}" (${isbnParsed}) is already in your collection` };
      }
      const book: Book = {
        ...bookData,
        isbn: isbnParsed,
        cover: undefined,
        userId,
        addedAtCollectionTime: new Date(),
        tags: [],
      };
      await mongo.addBook({ ...book });
      return book;
    } catch (error) {
      console.log(`🧨 Book not added (raw), reason : ${(<Error>error).message}`);
      if (error instanceof ISBNParseError) {
        return { error: 'INVALID_ISBN', description: `"${bookData.isbn}" is not a valid ISBN` };
      }
      return { error: 'UNKNOWN_ERROR', description: (<Error>error).message };
    }
  }

  public static async editBook(isbn: string, book: Book, userId: string): Promise<boolean> {
    try {
      const mongo = new MongoDB();
      if (book.userId === userId && await mongo.checkBook(isbn, userId)) {
        const existing = await mongo.getBook(isbn, userId);
        await mongo.editBook({ ...book, tags: existing.tags }, userId);
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

  private static async downloadCover(url: string, isbn: string): Promise<string | null> {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);
      return await saveCoverToStatic(buffer, isbn);
    } catch {
      return null;
    }
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
