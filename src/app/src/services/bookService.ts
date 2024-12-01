import config from '../config';
import { EHttpVerb, MainService } from './mainService';
import { BookSearchResponse } from '../types/book';

class BookService {
  public static async search(term: string, pageIndex = 0, pageSize = 200): Promise<BookSearchResponse> {
    console.info('📫 - Search books');
    const res = await MainService.handleApiCall(EHttpVerb.POST, `${config.API_URL}/book/search`, { searchTerm: term, pageIndex, pageSize });
    console.info('👏 - Search books', res);
    return res;
  }
}

export default BookService;