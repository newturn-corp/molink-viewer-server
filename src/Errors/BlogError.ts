import { CustomError } from './Common'

export class BlogNotExists extends CustomError {}

export class UnauthorizedForBlog extends CustomError {}
