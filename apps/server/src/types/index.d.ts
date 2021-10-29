declare module "http" {
  interface IncomingHttpHeaders {
    username?: string;
  }
}

declare namespace Express {
  interface Response {
    zip?: any;
  }
}
