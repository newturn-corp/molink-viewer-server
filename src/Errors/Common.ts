export class CustomError extends Error {
    constructor (message = '') {
        super(message)
    }
}

export class CustomErrorWithSlackNotification extends CustomError {}

export class InvalidParam extends CustomError {}
