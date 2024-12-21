import config from '../config';
import { EHttpVerb, MainService } from './mainService';
import { Book, BookSearchResponse } from '../types/book';

class BookService {
  public static async search(term: string, pageIndex = 0, pageSize = 200): Promise<BookSearchResponse> {
    console.info('📫 - Search books');
    const res = await MainService.handleApiCall(EHttpVerb.POST, `${config.API_URL}/book/search`, { searchTerm: term, pageIndex, pageSize });
    console.info('👏 - Search books', res);
    return res;
  }

  public static async get(isbn: string): Promise<Book> {
    console.info('📫 - Get book');
    const res = await MainService.handleApiCall(EHttpVerb.GET, `${config.API_URL}/book/${isbn}`);
    console.info('👏 - Get book', res);
    return res;
  }

  public static async edit(book: Book): Promise<boolean> {
    console.info('📫 - Edit book');
    const res = await MainService.handleApiCall(EHttpVerb.PUT, `${config.API_URL}/book/${book.isbn}`, { book });
    console.info('👏 - Edit book', res);
    return res;
  }

  public static async delete(isbn: string): Promise<boolean> {
    console.info('📫 - Delete book');
    const res = await MainService.handleApiCall(EHttpVerb.DELETE, `${config.API_URL}/book/${isbn}`);
    console.info('👏 - Delete book', res);
    return res;
  }

  public static async add(isbn: string): Promise<Book> {
    console.info('📫 - Add books');
    const res = await MainService.handleApiCall(EHttpVerb.POST, `${config.API_URL}/book/${isbn}`);
    console.info('👏 - Add books', res);
    return res;
  }
}

export default BookService;