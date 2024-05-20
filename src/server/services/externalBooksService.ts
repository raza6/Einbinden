import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';
import { Book } from '../types/books';
import { NoBookError } from '../utils/utils';

export default class externalBooksService {
  public static async getByISBN(isbn: string): Promise<Book> {
    try {
      const responseGoogle = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);      
      if (responseGoogle.data.totalItems > 0) {
        const bookGoogle = responseGoogle.data.items[0];
        const bookBNF = await externalBooksService.retrieveBNF(isbn);
        return {
          title: bookGoogle.volumeInfo.title ?? bookBNF.title,
          subtitle: bookGoogle.volumeInfo.subtitle ?? null,
          authors: bookGoogle.volumeInfo.authors ?? bookBNF.authors,
          publisher: bookGoogle.volumeInfo.publisher ?? bookBNF.publisher,
          publishedDate: bookGoogle.volumeInfo.publishedDate ?? bookBNF.publishedDate,
          isbn: isbn,
          hasIsbn: true,
          cover: `https://images.isbndb.com/covers/${[...isbn].splice(-4, 2).join('')}/${[...isbn].splice(-2).join('')}/${isbn}.jpg`,
        };
      } else {
        throw new NoBookError(`No reference on google for ${isbn}`);
      }
    } catch (error) { 
      throw new NoBookError((<AxiosError>error).message);
    }
  }
  
  private static async retrieveBNF(isbn: string): Promise<Book> {
    const responseBNF = await axios.get(`https://catalogue.bnf.fr/api/SRU?version=1.2&operation=searchRetrieve&query=bib.isbn adj "${isbn}"&recordSchema=unimarcXchange`);
    const htmlScrap = cheerio.load(responseBNF.data, { xmlMode: true });
    return {
      title: htmlScrap('[tag="200"] [code="a"]').text(),
      subtitle: null,
      authors: externalBooksService.extractBNFAuthors(htmlScrap),
      publisher: htmlScrap('[tag="214"] [code="c"]').text(),
      publishedDate: htmlScrap('[tag="214"] [code="d"]').text(),
      isbn: '',
      hasIsbn: true,
      cover: '',
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
}
