import MongoDB from "../mongo/mongo";
import { Book } from "../types/books";
import { parseISBN } from "../utils/isbn";
import googleBooksService from "./googleBooksService";

export default class bookService {
  public static async addBookViaIsbn(isbn: string): Promise<Book | null> {
    try {
      const isbnParsed = parseISBN(isbn);
      const book = await googleBooksService.getByISBN(isbnParsed);
      const mongo = new MongoDB();
      await mongo.addBook(book);
      return book;
    } catch (error) {
      console.log(`🧨 Book not added, reason : ${(<Error>error).message}`);
      return null;
    }
  }
}
