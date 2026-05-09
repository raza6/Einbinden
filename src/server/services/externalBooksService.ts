import axios from 'axios';
import * as cheerio from 'cheerio';
import { BookBase } from '../types/books';
import { BookFetchError } from '../utils/utils';

export default class externalBooksService {
  public static async getByISBN(isbn: string): Promise<BookBase> {
    const serviceErrors: { name: string; statusCode: number | undefined }[] = [];

    const tryRetrieve = async (serviceName: string, fetchFn: () => Promise<BookBase | null>): Promise<BookBase | null> => {
      try {
        return await fetchFn();
      } catch (error) {
        serviceErrors.push({ name: serviceName, statusCode: axios.isAxiosError(error) ? error.response?.status : undefined });
        return null;
      }
    };

    const allBooksRaw = await Promise.all([
      tryRetrieve('Google Books', () => externalBooksService.retrieveGoogle(isbn)),
      tryRetrieve('inventaire.io', () => externalBooksService.retrieveInventaire(isbn)),
      tryRetrieve('BNF', () => externalBooksService.retrieveBNF(isbn)),
      tryRetrieve('Open Library', () => externalBooksService.retrieveOpenLibrary(isbn)),
    ]);
    console.log('🧐 Data retrieved', allBooksRaw);
    const allBooks = allBooksRaw.filter(v => v !== null);

    if (allBooks.length > 0) {
      try {
        return externalBooksService.mergeBookRetrieval(allBooks);
      } catch {
        throw new BookFetchError(`No title found for ${isbn}`, serviceErrors);
      }
    } else {
      throw new BookFetchError(`No reference found for ${isbn}`, serviceErrors);
    }
  }

  private static async retrieveGoogle(isbn: string): Promise<BookBase | null> {
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
        cover: bookGoogle.volumeInfo.imageLinks?.extraLarge ?? bookGoogle.volumeInfo.imageLinks?.large ?? bookGoogle.volumeInfo.imageLinks?.medium ?? bookGoogle.volumeInfo.imageLinks?.small
      }
    } else {
      return null;
    }
  }

  private static async retrieveInventaire(isbn: string): Promise<BookBase | null> {
    const responseInventaire = await axios.get(`https://inventaire.io/api/entities/by-uris?uris=isbn:${isbn}&relatives=wdt:P50|wdt:P58|wdt:P629|wdt:P123`);  
    const data = responseInventaire.data;
    const editionEntity = data.entities?.[data.redirects?.[`isbn:${isbn}`]];
    if (!editionEntity) { 
      return null
    };

    const title = editionEntity.claims?.['wdt:P1476']?.[0] ?? editionEntity.labels?.fromclaims;
    const publishedDate = editionEntity.claims?.['wdt:P577']?.[0];
    const imgUrl: string | undefined = editionEntity.image?.url;

    const workWdUri: string | undefined = editionEntity.claims?.['wdt:P629']?.[0];
    const workEntity = workWdUri ? data.entities?.[workWdUri] : undefined;
    const sourceEntity = workEntity ?? editionEntity;
    const allAuthorWdUris: string[] = [
      ...(sourceEntity.claims?.['wdt:P50'] ?? []),
      ...(sourceEntity.claims?.['wdt:P58'] ?? []),
      ...(sourceEntity.claims?.['wdt:P110'] ?? []),
    ];
    const authors = allAuthorWdUris
      .map((uri: string) => externalBooksService.extractInventaireLabel(data.entities?.[uri]?.labels))
      .filter(name => name !== undefined);

    const publisherWdUri: string | undefined = editionEntity.claims?.['wdt:P123']?.[0];
    const publisher = externalBooksService.extractInventaireLabel(data.entities?.[publisherWdUri ?? '']?.labels);

    console.log(editionEntity)
    console.log(editionEntity.image)
    console.log(imgUrl)

    return {
      title,
      subtitle: undefined,
      authors,
      publisher,
      publishedDate,
      isbn,
      hasIsbn: true,
      cover: imgUrl !== undefined ? `https://inventaire.io${imgUrl}` : undefined
    };
  }

  private static extractInventaireLabel(labels: Record<string, string> | undefined): string | undefined {
    if (!labels) {
      return undefined;
    }
    return labels['fr'] ?? labels['en'] ?? labels['fromclaims'] ?? Object.values(labels)[0];
  }

  private static async retrieveBNF(isbn: string): Promise<BookBase | null> {
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
        cover: undefined
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

  private static async retrieveOpenLibrary(isbn: string): Promise<BookBase | null> {
    const response = await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
    const book = response.data[`ISBN:${isbn}`];
    if (book) {
      return {
        title: book.title,
        subtitle: book.subtitle,
        authors: book.authors?.map((a: { name: string }) => a.name),
        publisher: book.publishers?.[0]?.name,
        publishedDate: book.publish_date,
        isbn: isbn,
        hasIsbn: true,
        cover: book.cover?.large ?? book.cover?.medium
      };
    } else {
      return null;
    }
  }

  private static mergeBookRetrieval(books: BookBase[]): BookBase {
    const finalBook = {
      title: books.map(book => book.title).filter(v => v !== undefined)?.[0] ?? '',
      subtitle: books.map(book => book.subtitle).filter(v => v !== undefined)?.[0] ?? '',
      authors: books.map(book => book.authors).filter(v => v !== undefined)?.[0] ?? '',
      publisher: books.map(book => book.publisher).filter(v => v !== undefined)?.[0] ?? '',
      publishedDate: books.map(book => book.publishedDate).filter(v => v !== undefined)?.[0] ?? '',
      isbn: books[0].isbn,
      hasIsbn: true,
      cover: books.map(book => book.cover).filter(v => v !== undefined)?.[0] ?? '',
    };

    if (finalBook.title === '') {
      throw new Error(`No title found for ${finalBook.isbn}`);
    } else {
      return finalBook;
    }
  }
}
