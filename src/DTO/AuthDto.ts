export class SignInDto {
    email: string
    pwd: string
    remember: boolean

    constructor (email: string, pwd: string, remember: boolean) {
        this.email = email
        this.pwd = pwd
        this.remember = remember
    }
}

export class SaveChangePasswordDto {
    email: string

    constructor (email: string) {
        this.email = email
    }
}

export class ChangePasswordDto {
    hash: string
    pwd: string

    constructor (hash: string, pwd: string) {
        this.hash = hash
        this.pwd = pwd
    }
}

export class VerifyEmailDto {
    hash: string
    constructor (hash: string) {
        this.hash = hash
    }
}
