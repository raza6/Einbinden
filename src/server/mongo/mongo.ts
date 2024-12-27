import {
  MongoClient, MongoError, FindCursor,
  Sort,
  PullOperator
} from 'mongodb';
import colors from 'colors';
import { NoCollectionError } from '../utils/utils';
import EnvWrap from '../utils/envWrapper';
import { User } from '../types/user';
import { Book, BookSearchResponse } from '../types/books';

export default class MongoDB {
  public static dbName = 'Einbinden';

  private static collectionBooks = 'Books';

  private static collectionUsers = 'Users';

  private static dbConnect;

  static {
    let connectionString = `${EnvWrap.get().value('MONGO_URL')}:${EnvWrap.get().value('MONGO_PORT')}`;
    if (EnvWrap.get().value('MONGO_USER') !== '') {
      connectionString = `${EnvWrap.get().value('MONGO_USER')}:${EnvWrap.get().value('MONGO_PASSWORD')}@${connectionString}`;
    }
    this.dbConnect = `mongodb://${connectionString}`;
  }

  private client: MongoClient;

  constructor() {
    this.client = new MongoClient(MongoDB.dbConnect);
  }

  private async run(command: Function): Promise<void|unknown> {
    let res;
    try {
      await this.client.connect();
      res = await command();
      return res;
    } catch (ex) {
      console.log(`💀 ${colors.red('Einbinden failed to execute command')}`, ex);
      return res;
    } finally {
      // Ensures that the client will close when you finish/error
      await this.client.close();
    }
  }

  public exposeClient(): MongoClient {
    return this.client;
  }

  public async start(): Promise<void> {
    try {
      await this.client.connect();

      const allCollectionsDetail = await this.client.db(MongoDB.dbName).listCollections().toArray();
      const allCollections = allCollectionsDetail.map((detail) => detail.name);

      if (allCollections.length === 0) {
        throw new NoCollectionError('No collection found');
      }

      console.log('Connected to DB with collections :', allCollections.reduce((acc, c) => (acc !== '' ? `${acc}, ${c}` : c), ''));
    } catch (ex) {
      if (ex instanceof MongoError) {
        console.log(`💀 ${colors.red('Einbinden failed to connect to DB')}`);
      } else if (ex instanceof NoCollectionError) {
        console.log(`💀 ${colors.red('Einbinden has no collections available')}`);
      } else {
        console.log(`💀 ${colors.red('Einbinden unknown error while starting')}`);
      }
    } finally {
      await this.client.close();
    }
  }

  public async getUser(userId: string): Promise<User> {
    return <User><unknown> await this.run(
      () => this.client.db(MongoDB.dbName).collection(MongoDB.collectionUsers).findOne({ id: userId }, { projection: { _id: 0 } }),
    );
  }

  public async checkUser(userId: string, withLastConnectionUpdate: boolean = false): Promise<boolean> {
    const exist = await this.run(
      () => this.client.db(MongoDB.dbName).collection(MongoDB.collectionUsers).countDocuments({ id: userId }),
    ) === 1;
    if (exist && withLastConnectionUpdate) {
      await this.run(
        () => this.client.db(MongoDB.dbName).collection(MongoDB.collectionUsers)
          .updateOne({ id: userId }, { $currentDate: { lastConnection: true } }),
      );
    }
    return exist;
  }

  public async addUser(user: User): Promise<void> {
    await this.run(
      () => this.client.db(MongoDB.dbName).collection(MongoDB.collectionUsers).insertOne(user),
    );
  }

  public async addTag(tag: string, userId: string): Promise<void> {
    await this.run(
      () => this.client.db(MongoDB.dbName).collection(MongoDB.collectionUsers).updateOne(
        { id: userId },
        { $addToSet: { tags: tag } }
      ),
    );
  }

  // TODO WHEN DELETE TAG, REMOVE ALSO FROM BOOKS
  public async deleteTag(tag: string, userId: string): Promise<void> {
    await this.run(
      () => this.client.db(MongoDB.dbName).collection(MongoDB.collectionUsers).updateOne(
        { id: userId },
        { $pull: { tags: tag } as unknown as PullOperator<User> }
      ),
    );
  }

  public async addBook(book: Book): Promise<void> {
    await this.run(
      () => this.client.db(MongoDB.dbName).collection(MongoDB.collectionBooks).insertOne(book),
    );
  }

  public async editBook(book: Book, userId: string): Promise<void> {
    await this.run(
      () => this.client.db(MongoDB.dbName).collection(MongoDB.collectionBooks).findOneAndReplace({ isbn: book.isbn, userId: userId }, book),
    );
  }

  public async getBook(isbn: string, userId: string): Promise<Book> {
    return <Book><unknown> await this.run(
      () => this.client.db(MongoDB.dbName).collection(MongoDB.collectionBooks).findOne({ isbn: isbn, userId: userId }, { projection: { _id: 0 } }),
    );
  }

  public async deleteBook(isbn: string, userId: string): Promise<void> {
    await this.run(
      () => this.client.db(MongoDB.dbName).collection(MongoDB.collectionBooks).deleteOne({ isbn: isbn, userId: userId }),
    );
  }

  public async checkBook(isbn: string, userId: string): Promise<boolean> {
    return await this.run(
      () => this.client.db(MongoDB.dbName).collection(MongoDB.collectionBooks).countDocuments({ isbn: isbn, userId: userId })
    ) === 1;
  }

  public async searchBook(
    term: string,
    pageIndex = 0,
    pageSize = 20,
    userId: string
  ): Promise<BookSearchResponse> {
    const searchParam = term === '' ? { userId: userId } : { userId: userId, $or: [{ 'title': { $regex: `${term}`, $options: 'i' } }, { $text: { $search: `${term}` } }] };
    const projectParam = term === '' ? { _id: 0 } : { _id: 0, score: { $meta: "textScore" }};
    const sortParam = term === '' ? { 'title': 1, 'subtitle': 1 } : { score: { $meta: 'textScore' } };

    const result = <Array<Book>><unknown> await this.run(
      () => {
        const cursor = <FindCursor><unknown> this.client.db(MongoDB.dbName).collection(MongoDB.collectionBooks)
          .find(searchParam)
          .project(projectParam)
          .sort(<Sort><unknown>sortParam)
          .skip(pageIndex * pageSize)
          .limit(pageSize);

        return cursor.toArray();
      },
    );

    const countResult = <number><unknown> await this.run(
      () => this.client.db(MongoDB.dbName).collection(MongoDB.collectionBooks).countDocuments(searchParam),
    );

    return {
      books: result,
      count: countResult,
    };
  }
}
