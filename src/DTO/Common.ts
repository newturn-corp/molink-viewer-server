import { IsArray, IsNumber, IsObject, IsOptional, IsString } from 'class-validator'

export class ResponseMessage<T> {
    @IsNumber()
    status: number;

    @IsOptional()
    @IsObject()
    data?: T;

    @IsOptional()
    @IsArray()
    arr?: T[];

    @IsString()
    msg: string;

    constructor (status: number, msg: string, data: T | T[]) {
        this.status = status
        this.msg = msg
        if (Array.isArray(data)) {
            this.arr = data
        } else {
            this.data = data
        }
    }
}

export function makeResponseMessage<T> (status: number, data: T | T[]) {
    return new (class extends ResponseMessage<T> {})(status, '', data)
}

export function makeEmptyResponseMessage (status: number) {
    return {
        status,
        msg: '',
        data: undefined,
        arr: undefined
    }
}
