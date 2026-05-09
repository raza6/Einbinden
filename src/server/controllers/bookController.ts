import { Request, Response, Express } from 'express';
import multer from 'multer';
import { ensureAuthenticated } from '../utils/utils';
import { saveCoverToStatic } from '../utils/image';
import bookService from '../services/bookService';
import { User } from '../types/user';
import { BookAddError } from '../types/books';

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
   * @apiName BookAddRaw
   * @apiGroup Book
   * @api {POST} /ebd/book Add a book manually
   * @apiDescription Adds a book directly from provided metadata, without ISBN lookup or cover handling
   *
   * @apiBody {Book} book The edited book as a full object
   * @apiUse BookSuccess
   * @apiError (400) {BookAddError} AlreadyInCollection Book is already in the user's collection
   * @apiError (401) {null} UserNotAuthenticated
   */
  serv.post('/ebd/book', ensureAuthenticated, async (req: Request, res: Response) => {
    const result = await bookService.addBookRaw(req.body.book, (req.user as User).id.toString());
    if ((result as BookAddError).error !== undefined) {
      res.status(400).json(result);
    } else {
      res.status(200).send(result);
    }
  });

  /**
   * @apiName BookAddISBN
   * @apiGroup Book
   * @api {POST} /ebd/book/:isbn Try to add book via ISBN
   *
   * @apiparam {string} isbn ISBN of the book
   *
   * @apiUse BookSuccess
   * @apiError (400) {null} BookNotFound Book with isbn <code>isbn</code>
   */
    serv.post('/ebd/book/:isbn', ensureAuthenticated, async (req: Request, res: Response) => {
      const result = await bookService.addBookViaIsbn(req.params.isbn, (req.user as User).id.toString());
      if ((result as BookAddError).error !== undefined) {
        res.status(400).json(result);
      } else {
        res.status(200).send(result);
      }
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

  /**
   * @apiName BookCover
   * @apiGroup Book
   * @api {POST} /ebd/book/:isbn/cover Add cover to a book
   *
   * @apiparam {string} isbn ISBN of the book
   * @apiBody {File} files.img The cover image of the book
   *
   * @apiError (400) {string} NoFileAttached No image file attached with the request
   * @apiError (400) {string} BookNotFound No book found for provided isbn
   * @apiError (400) {string} FileAttachedFormat File attached with the request are not .png or .jpg
   * @apiError (400) {string} FileAttachedSize File attached with the request are more than 4MB in size
   * @apiError (400) {string} ImageManipulation Fatal error while manipulating the image
   * @apiError (401) {null} UserNotAuthenticated
   */
  const storage = multer.memoryStorage()
  const upload = multer({ storage: storage });
  serv.post('/ebd/book/:isbn/cover', ensureAuthenticated, upload.single('cover'), async (req: Request, res: Response) => {
    let error: string|undefined;
    if (req.file === undefined || req.file === null) {
      error = 'No file attached';
    } else {
      const reqFile = req.file;

      if (!['image/jpeg', 'image/png'].includes(reqFile.mimetype)) {
        error = 'Attached file is not a .png or a .jpg';
      } else if (reqFile.size >= 4 * 1024 * 1024) {
        error = 'Attached file size is more than 4MB';
      } else {
        const isbn = req.params.isbn;
        const userId = (req.user as User).id.toString();
        const book = await bookService.getBook(isbn, userId);
        if (book === null) {
          error = `Book ${isbn} does not exist for ${userId}`;
        } else {
          try {
            book.cover = await saveCoverToStatic(reqFile.buffer, isbn);
            await bookService.editBook(isbn, book, userId);
          } catch (err) {
            error = `Error while manipulating image : ${err}`;
          }
        }
      }
    }
    
    console.log(error ? `😔 img not added : ${error}` : '😀 img added');
    res.status(error ? 400 : 200).send(error ?? true);
  });
};

export default bookController;

/* API DEFINITION */

/**
 * @apiDefine BookSuccess
 * @apiSuccess {Book} book The book involved
 */
