import { HttpError } from 'routing-controllers'
import { ResponseMessage } from '../DTO/Common'

export class CustomHttpError extends HttpError {
    constructor (httpStatus: number, private detailStatus: number, private msg: string) {
        super(httpStatus)
        Object.setPrototypeOf(this, CustomHttpError.prototype)
    }

    toJson (): ResponseMessage<unknown> {
        return {
            status: this.httpCode * 10 ** Math.max(4 - `${this.detailStatus}`.length, 0) + this.detailStatus,
            msg: this.msg
        }
    }
}
