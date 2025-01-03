/* eslint-disable no-unused-vars */
enum EAuthOrigin {
  Github,
}

interface User {
  id: string,
  name: string,
  avatar: string,
  origin: EAuthOrigin.Github,
  lastConnection: Date,
  tags: string[],
}

export {
  EAuthOrigin, User,
};
