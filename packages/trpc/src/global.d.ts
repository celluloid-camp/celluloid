
declare namespace Express {
  export interface Request {
    user?: User; // 'User' should be imported or defined before this
  }
}
