import { CustomError } from './Common'

export class UserAlreadyExists extends CustomError {}

export class InvalidEmail extends CustomError {}

export class InvalidPassword extends CustomError {}

export class InvalidNickname extends CustomError {}

export class InvalidBlogName extends CustomError {}

export class NicknameAlreadyExist extends CustomError {}

export class BlogNameAlreadyExist extends CustomError {}

export class UserAccountNotExist extends CustomError {}

export class TooManySignUpRequestWithSameIP extends CustomError {}

export class TooManySignUpRequestWithSameID extends CustomError {}

export class TooManyLoginAttempt extends CustomError {}

export class WrongEmailOrPassword extends CustomError {}

export class ExpiredEmailAuth extends CustomError {}

export class EmailUnauthorized extends CustomError {}

export class UserNotExists extends CustomError {}

export class TooManyPasswordChangeRequestWithSameIP extends CustomError {}

export class TooManyPasswordChangeRequestWithSameID extends CustomError {}

export class PasswordChangeNotExist extends CustomError {}

export class TooManyEmailAuthRequest extends CustomError {}

export class UserAlreadyAuthorized extends CustomError {}
