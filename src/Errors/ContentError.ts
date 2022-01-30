import { CustomError } from './Common'

export class ContentNotExists extends CustomError {}

export class ContentUserNotExists extends CustomError {}

export class UnauthorizedForContent extends CustomError {}
