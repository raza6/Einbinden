import { Request, Response, Express } from 'express';
import { Jimp } from 'jimp';
import formidable from 'formidable';
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
   * @api {POST} /ebd/book/:isbn Try to add book via ISBN
   *
   * @apiparam {string} isbn ISBN of the book
   *
   * @apiUse BookSuccess
   * @apiError (400) {null} BookNotFound Book with isbn <code>isbn</code>
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

  /**
   * @apiName BookCover
   * @apiGroup Book
   * @api {POST} /ebd/book/:isbn/cover Add cover to a book
   *
   * @apiparam {string} isbn ISBN of the book
   * @apiBody {File} files.img The cover image of the book
   *
   * @apiError (400) {string} NoFileAttached No image file attached with the request
   * @apiError (400) {string} ManyFileAttached More than one image file attached with the request
   * @apiError (400) {string} FileAttachedFormat File attached with the request are not .png or .jpg
   * @apiError (400) {string} FileAttachedSize File attached with the request are more than 4MB in size
   * @apiError (400) {string} NoFileAttached No image file attached with the request
   * @apiError (400) {string} ImageManipulation Fatal error while manipulating the image
   * @apiError (401) {null} UserNotAuthenticated
   */
  serv.post('/ebd/book/:isbn/cover', ensureAuthenticated, async (req: Request, res: Response) => {
    const form = formidable({
      fileWriteStreamHandler //TODO in memory only, jimp write
    });

    form.parse(req, (err, fields, files) => {
      let error;
      if (err) {
        error = 'Error while parsing request';
      } else {
        // check if file is valid
        if (files === undefined || files === null) {
          error = 'No img file attached';
        } else if (Array.isArray(files.img)) {
          error = 'More than 1 img file attached';
        } else {
          const reqFile = req.files.img;
  
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
              Jimp.read(reqFile.tempFilePath)
                .then(async (image) => {
                  await image
                    .cover({ w: 600, h: 400 })
                    .write(`./static/img/${isbn}.jpg`);
                  book.cover = `/ebd/static/img/${isbn}.jpg`;
                  await bookService.editBook(isbn, book, userId);
                })
                .catch((err) => {
                  error = `Error while manipulating image : ${err}`;
                });
            }
          }
        }
      }


      console.log(error ? `😔 img not added : ${error}` : '😀 img added');
      res.status(error ? 400 : 200).send(error);
    });
  });
};

export default bookController;

/* API DEFINITION */

/**
 * @apiDefine BookSuccess
 * @apiSuccess {Book} book The book involved
 */
