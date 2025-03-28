import { Request, Response, Express } from 'express';
import { ensureAuthenticated } from '../utils/utils';
import bookService from '../services/bookService';
import { User } from '../types/user';

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
    console.log('Test: hello');
    res.status(200).send('hello');
  });

  /**
   * @apiName BookDelete
   * @apiGroup Book
   * @api {DELETE} /ebd/book/:id Delete a book
   *
   * @apiParam {string} isbn ISBN of the book
   * @apiError (401) {null} UserNotAuthenticated
   */
  serv.delete('/ebd/book/:id', ensureAuthenticated, async (req: Request, res: Response) => {
    const result = await bookService.deleteBook(req.params.id, (req.user as User).id.toString());
    console.log(result ? '😀 book deleted' : '😔 book not deleted');
    res.status(result ? 200 : 400).send(result);
  });

  /**
   * @apiName BookDetail
   * @apiGroup Book
   * @api {GET} /ebd/book/:isbn Get a book
   *
   * @apiParam {string} isbn ISBN of the book
   * @apiError (401) {null} UserNotAuthenticated
   */
  serv.get('/ebd/book/:isbn', ensureAuthenticated, async (req: Request, res: Response) => {
    const result = await bookService.getBook(req.params.isbn, (req.user as User).id.toString());
    res.status(200).send(result);
  });

  /**
   * @apiName BookSearch
   * @apiGroup Book
   * @api {POST} /ebd/book/search Search for books
   * @apiDescription Serve a list of books according to a search term and pagination
   *
   * @apiBody {BookRequest} bookRequest The request containing the search term and pagination parameters
   * @apiUse BookSearchSuccess
   */
  serv.post('/ebd/book/search', ensureAuthenticated, async (req: Request, res: Response) => {
    const { searchTerm, pageIndex, pageSize } = req.body;
    const result = await bookService.searchBook(searchTerm, pageIndex, pageSize, (req.user as User).id.toString());
    res.status(200).send(result);
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
      const result = await bookService.addBookViaIsbn(req.params.isbn, (req.user as User).id.toString());
      res.status(result ? 200 : 400).send(result);
    });

      /**
   * @apiName BookDetail
   * @apiGroup Book
   * @api {PUT} /ebd/book/:isbn Edit a book
   *
   * @apiParam {string} isbn ISBN of the book
   * @apiBody {Book} book The edited book as a full object
   * @apiError (401) {null} UserNotAuthenticated
   */
  serv.put('/ebd/book/:isbn', ensureAuthenticated, async (req: Request, res: Response) => {
    const result = await bookService.editBook(req.params.isbn, req.body.book, (req.user as User).id.toString());
    res.status(result ? 200 : 400).send(result);
  });
};

export default bookController;

/* API DEFINITION */

/**
 * @apiDefine BookSuccess
 * @apiSuccess {Book} book The book involved
 */
