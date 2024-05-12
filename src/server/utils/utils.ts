import { Request, Response } from 'express';

class NoCollectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NoCollectionError';
  }
}

function ensureAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.sendStatus(401);
}

export { NoCollectionError, ensureAuthenticated };
