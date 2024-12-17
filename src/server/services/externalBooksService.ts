import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';
import { Book } from '../types/books';
import { NoBookError } from '../utils/utils';

export default class externalBooksService {
  public static async getByISBN(isbn: string): Promise<Book> {
    try {
      // Retrieve from all data points
      const bookGoogle = await externalBooksService.retrieveGoogle(isbn);
      const bookInventaire = await externalBooksService.retrieveInventaire(isbn);
      const bookBNF = await externalBooksService.retrieveBNF(isbn);
      const allBooks = [bookGoogle, bookInventaire, bookBNF].filter(v => v !== null);
      if (allBooks.length > 0) {
        return externalBooksService.mergeBookRetrieval(<Book[]>allBooks);
      } else {
        throw new NoBookError(`No reference found anywhere for ${isbn}`);
      }
    } catch (error) { 
      throw new NoBookError((<AxiosError>error).message);
    }
  }

  private static async retrieveGoogle(isbn: string): Promise<Book | null> {
    const responseGoogle = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);      
    const bookGoogle = responseGoogle.data.items?.[0];
    if (bookGoogle) {
      return {
        title: bookGoogle.volumeInfo.title,
        subtitle: bookGoogle.volumeInfo.subtitle,
        authors: bookGoogle.volumeInfo.authors,
        publisher: bookGoogle.volumeInfo.publisher,
        publishedDate: bookGoogle.volumeInfo.publishedDate,
        isbn: isbn,
        hasIsbn: true,
        cover: undefined,
      }
    } else {
      return null;
    }
  }

  private static async retrieveInventaire(isbn: string): Promise<Book | null> {
    const responseInventaire = await axios.get(`https://inventaire.io/api/data?action=isbn&isbn=${isbn}`);
    const bookInventaire = responseInventaire.data;
    if (bookInventaire) {
      const inventaireImg = await axios.get(`https://inventaire.io/api/entities?action=by-uris&uris=isbn:${isbn}&refresh=false`);
      const imgUrl = inventaireImg.data?.entities?.[`isbn:${isbn}`]?.image?.url;
      return {
        title: bookInventaire.title,
        subtitle: undefined,
        authors: bookInventaire.authors,
        publisher: undefined,
        publishedDate: bookInventaire.publicationDate,
        isbn: isbn,
        hasIsbn: true,
        cover: imgUrl !== undefined ? `https://inventaire.io${imgUrl}` : undefined,
      }
    } else {
      return null;
    }
  }

  private static async retrieveBNF(isbn: string): Promise<Book | null> {
    const responseBNF = await axios.get(`https://catalogue.bnf.fr/api/SRU?version=1.2&operation=searchRetrieve&query=bib.isbn adj "${isbn}"&recordSchema=unimarcXchange`);
    const htmlScrap = cheerio.load(responseBNF.data, { xmlMode: true });
    if (parseInt(htmlScrap('srw\\:numberOfRecords').text(), 10) > 0) {
      return {
        title: htmlScrap('[tag="200"] [code="a"]').text(),
        subtitle: undefined,
        authors: externalBooksService.extractBNFAuthors(htmlScrap),
        publisher: htmlScrap('[tag="214"] [code="c"]').text(),
        publishedDate: htmlScrap('[tag="214"] [code="d"]').text(),
        isbn: isbn,
        hasIsbn: true,
        cover: undefined,
      }
    } else {
      return null;
    }
  }

  private static extractBNFAuthors(scrapper: cheerio.CheerioAPI): Array<string> {
    let authors: string[] = []
    scrapper('[tag="700"] [code="b"]').each(function(i) { authors[i] = scrapper(this).text()});
    scrapper('[tag="700"] [code="a"]').each(function(i) { authors[i] += ` ${scrapper(this).text()}`});
    if (authors.length === 0) {
      scrapper('[tag="702"] [code="b"]').each(function(i) { authors[i] = scrapper(this).text()});
      scrapper('[tag="702"] [code="a"]').each(function(i) { authors[i] += ` ${scrapper(this).text()}`});
    }
    return authors;
  }

  private static mergeBookRetrieval(books: Book[]): Book {
    const finalBook = {
      title: books.map(book => book.title).filter(v => v !== undefined)?.[0] ?? '',
      subtitle: books.map(book => book.subtitle).filter(v => v !== undefined)?.[0] ?? '',
      authors: books.map(book => book.authors).filter(v => v !== undefined)?.[0] ?? '',
      publisher: books.map(book => book.publisher).filter(v => v !== undefined)?.[0] ?? '',
      publishedDate: books.map(book => book.publishedDate).filter(v => v !== undefined)?.[0] ?? '',
      isbn: books[0].isbn,
      hasIsbn: true,
      cover: books.map(book => book.cover).filter(v => v !== undefined)?.[0] ?? `https://images.isbndb.com/covers/${[...books[0].isbn].splice(-4, 2).join('')}/${[...books[0].isbn].splice(-2).join('')}/${books[0].isbn}.jpg`,
    };

    if (finalBook.title === '') {
      throw new NoBookError(`No title found for ${finalBook.isbn}`);
    } else {
      return finalBook;
    }
  }
}
