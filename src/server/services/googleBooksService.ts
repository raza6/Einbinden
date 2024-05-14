import axios, { AxiosError } from 'axios';
import { Book } from '../types/books';
import { NoBookError } from '../utils/utils';

export default class googleBooksService {
  public static async getByISBN(isbn: string): Promise<Book> {
    try {
      const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
      if (response.data.totalItems > 0) {
        const book = response.data.items[0];
        return {
          isbn: isbn,
          title: book.volumeInfo.title,
          authors: book.volumeInfo.authors,
          publisher: book.volumeInfo.publisher,
          publishedDate: book.volumeInfo.publishedDate,
          cover: `https://images.isbndb.com/covers/${[...isbn].splice(-4, 2).join('')}/${[...isbn].splice(-2).join('')}/${isbn}.jpg`,
          hasIsbn: true,
        };
      } else {
        throw new NoBookError(`No reference on google for ${isbn}`);
      }
    } catch (error) { 
      throw new NoBookError((<AxiosError>error).message);
    }
  }
}
