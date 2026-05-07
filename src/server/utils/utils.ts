import { Request, Response } from 'express';

class NoCollectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NoCollectionError';
  }
}

class BookFetchError extends Error {
  constructor(message: string, public readonly services: { name: string; statusCode: number | undefined }[]) {
    super(message);
    this.name = 'BookFetchError';
  }
}

function ensureAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.sendStatus(401);
}

export { NoCollectionError, BookFetchError, ensureAuthenticated };
