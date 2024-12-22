import { Request, Response, Express } from 'express';
import shareService from '../services/shareService';
import bookService from '../services/bookService';

/**
 * API
 */
const shareController = (serv: Express) => {
  /**
   * @apiName ShareUserDetail
   * @apiGroup Share
   * @api {GET} /ebd/share/:shareId Get shared user name
   *
   * @apiDescription Return username corresponding to a shareId
   */
  serv.get('/ebd/share/:shareId', async (req: Request, res: Response) => {
    const result = await shareService.getUserDetail(req.params.shareId);
    res.status(result ? 200 : 400).send(result);
  });

   /**
   * @apiName ShareSearch
   * @apiGroup Share
   * @api {POST} /ebd/share/search/:shareId Search for shared books
   * @apiDescription Serve a list of books according to a search term, pagination and shareId
   *
   * @apiBody {BookRequest} bookRequest The request containing the search term and pagination parameters
   * @apiUse BookSearchSuccess
   */
    serv.post('/ebd/share/search/:shareId', async (req: Request, res: Response) => {
      const { searchTerm, pageIndex, pageSize } = req.body;
      const shareId = req.params.shareId;
      if (shareId) {
        const userId = parseInt(shareId.slice(2), 16).toString(); 
        const result = await bookService.searchBook(searchTerm, pageIndex, pageSize, userId);
        res.status(200).send(result);
      } else {
        res.status(400).send();
      }
    });
};

export default shareController;

/* API DEFINITION */

/**
 * @apiDefine BookSuccess
 * @apiSuccess {Book} book The book involved
 */
