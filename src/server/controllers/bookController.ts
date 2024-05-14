import { Request, Response, Express } from 'express';
import { ensureAuthenticated } from '../utils/utils';
import bookService from '../services/bookService';

/**
 * API
 */
const bookController = (serv: Express) => {
  /**
   * @apiName Test
   * @apiGroup Test
   * @api {GET} /ebd/test Test endpoint
   *
   * @apiDescription Will return a 200 with "hello" if the api is up and running
   */
  serv.get('/ebd/test', (req: Request, res: Response) => {
    console.log('hello');
    res.status(200).send('hello');
  });

  /**
   * @apiName BookAddISBN
   * @apiGroup Book
   * @api {POST} /ebd/book/:isbn Try to add book via ISBN through google API
   *
   * @apiparam {string} isbn ISBN of the book
   *
   * @apiUse BookSuccess
   * @apiError (400) {null} BookNotFound Book with isbn <code>isbn</code> was not found by google API
   */
  serv.post('/ebd/book/:isbn', ensureAuthenticated, async (req: Request, res: Response) => {
    const result = await bookService.addBookViaIsbn(req.params.isbn);
    res.status(result ? 200 : 400).send(result);
  });
};

export default bookController;

/* API DEFINITION */

/**
 * @apiDefine BookSuccess
 * @apiSuccess {Book} book The book involved
 */
