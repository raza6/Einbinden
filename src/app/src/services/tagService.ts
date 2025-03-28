import config from '../config';
import { EHttpVerb, MainService } from './mainService';

class TagService {
  public static async getTags(): Promise<Array<string>> {
    console.info('📫 - Get user tags');
    const res = await MainService.handleApiCall(EHttpVerb.GET, `${config.API_URL}/tag`);
    console.info('👏 - Get user tags', res);
    return res;
  }

  public static async addTag(tag: string): Promise<boolean> {
    console.info('📫 - Add user tag');
    const res = await MainService.handleApiCall(EHttpVerb.POST, `${config.API_URL}/tag`, { tag });
    console.info('👏 - Add user tag', res);
    return res;
  }

  public static async deleteTag(tag: string): Promise<boolean> {
    console.info('📫 - Delete user tag');
    const res = await MainService.handleApiCall(EHttpVerb.POST, `${config.API_URL}/tag/delete`, { tag });
    console.info('👏 - Delete user tag', res);
    return res;
  }

  public static async updateBookTags(bookISBN: string, tags: Array<string>): Promise<boolean> {
    console.info('📫 - Update book tags');
    const res = await MainService.handleApiCall(EHttpVerb.POST, `${config.API_URL}/tag/book`, { bookISBN, tags });
    console.info('👏 - Update book tags', res);
    return res;
  }
}

export default TagService;