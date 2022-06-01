import { CustomError } from './Common'

export class PageNotExists extends CustomError {}

export class UnauthorizedForPage extends CustomError {}

export class TooManyPageRequestError extends CustomError {}
