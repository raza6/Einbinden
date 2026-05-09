import config from '../config';
import { EHttpVerb, MainService } from './mainService';
import { Book, BookAddError, BookSearchResponse } from '../types/book';

class BookService {
  public static async search(term: string, pageIndex = 0, pageSize = 200): Promise<BookSearchResponse> {
    console.info(`📫 - Search books : ${term}`);
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

  public static async editCover(isbn: string, bookCover: File): Promise<boolean> {
    console.info('📫 - Edit book cover');
    const formData = new FormData();
    formData.append('cover', bookCover);
    const requestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    const res = await MainService.handleApiCall(EHttpVerb.POST, `${config.API_URL}/book/${isbn}/cover`, formData, requestConfig);
    console.info('👏 - Edit book cover', res);
    return res;
  }

  public static async delete(isbn: string): Promise<boolean> {
    console.info('📫 - Delete book');
    const res = await MainService.handleApiCall(EHttpVerb.DELETE, `${config.API_URL}/book/${isbn}`);
    console.info('👏 - Delete book', res);
    return res;
  }

  public static async add(isbn: string): Promise<{ book: Book | null; error: BookAddError | null }> {
    console.info(`📫 - Add books : ${isbn}`);
    const res = await MainService.handleApiCallWithError<Book, BookAddError>(EHttpVerb.POST, `${config.API_URL}/book/${isbn}`, null);
    console.info('👏 - Add books', res);
    if (res.error) {
      return { book: null, error: res.error.body ?? { error: 'FETCH_ERROR', description: 'Unknown error' } };
    } else {
      return { book: res.data, error: null };
    }
  }

  public static async addRaw(book: Book): Promise<{ book: Book | null; error: BookAddError | null }> {
    console.info('📫 - Add book raw');
    const res = await MainService.handleApiCallWithError<Book, BookAddError>(EHttpVerb.POST, `${config.API_URL}/book`, { book });
    console.info('👏 - Add book raw', res);
    if (res.error) {
      return { book: null, error: res.error.body ?? { error: 'UNKNOWN_ERROR', description: 'Unknown error' } };
    } else {
      return { book: res.data, error: null };
    }
  }
}

export default BookService;