import config from '../config';
import { BookSearchResponse } from '../types/book';
import { EHttpVerb, MainService } from './mainService';

class ShareService {
  public static async get(shareId: string): Promise<string> {
    console.info('📫 - Get share username');
    const res = await MainService.handleApiCall(EHttpVerb.GET, `${config.API_URL}/share/${shareId}`);
    console.info('👏 - Get share username', res);
    return res;
  }

  public static async search(shareId: string, term: string, pageIndex = 0, pageSize = 200): Promise<BookSearchResponse> {
    console.info('📫 - Search share books');
    const res = await MainService.handleApiCall(EHttpVerb.POST, `${config.API_URL}/share/search/${shareId}`, { searchTerm: term, pageIndex, pageSize });
    console.info('👏 - Search share books', res);
    return res;
  }
}

export default ShareService;