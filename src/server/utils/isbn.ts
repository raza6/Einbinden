class ISBNParseError extends Error {
  constructor(message: string) {
    super(`${message} is not a valid ISBN`);
    this.name = 'ISBNParseError';
  }
}

function checkControlKeyISBN(isbn: string): boolean {
  // isbn 10 -> modulus 11 with weighted position
  if (isbn.length === 10) {
    const sum = 
      [...Array(isbn.length).keys()].reverse().slice(0, -1).map(v => v+1)
      .reduce((acc, v, i) => acc + (v * (+isbn[i])), 0);
    let key = (11 - (sum % 11)) % 11;
    if (key === 11) {
      key = 0;
    }
    return key === +isbn[isbn.length - 1];
  // isbn 13 -> modulus 10 with alternate 1/3 weight
  } else {
    const sum = 
      [...Array(isbn.length - 1)].map((v, i) => i % 2 === 0 ? 1 : 3)
      .reduce((acc, v, i) => acc + (v * (+isbn[i])), 0);
    let key = 10 - (sum % 10);
    if (key === 10) {
      key = 0;
    }
    return key === +isbn[isbn.length - 1];
  }
}

// remove hyphen
// check length (10 or 13)
// check is all number
// check control key
function parseISBN(isbn: string): string {
  isbn = isbn.replace('-', '');
  if (isbn.length === 10 || isbn.length === 13) {
    if (/^\d+X?$/.test(isbn)) {
      if (checkControlKeyISBN(isbn)) {
        return isbn;
      }
    }
  }
  throw new ISBNParseError(isbn);
}

export { parseISBN, ISBNParseError };
