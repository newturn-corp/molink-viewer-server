import { ValidationError } from 'class-validator'
import express from 'express'
import { ExpressErrorMiddlewareInterface, HttpError, Middleware, UnauthorizedError } from 'routing-controllers'
import { ResponseMessage } from '../DTO/Common'
import env from '../env'
import { CustomErrorWithSlackNotification } from '../Errors/Common'
import { CustomHttpError } from '../Errors/HttpError'
import Slack from '../utils/Slack'

/**
 * Express middleware to catch all errors throwed in controlers.
 * Should be first in error chain as it sends response to client.
 *
 * @export
 * @class CustomErrorHandler
 * @implements {ExpressErrorMiddlewareInterface}
 */
@Middleware({ type: 'after' })
export class CustomErrorHandler implements ExpressErrorMiddlewareInterface {
    /**
     * Error handler - sets response code and sends json with error message.
     * Handle: standard node error, HttpError, ValidationError and string.
     *
     * @param {any} error An throwed object (error)
     * @param {express.Request} req The Express request object
     * @param {express.Response} res The Express response object
     * @param {express.NextFunction} next The next Express middleware function
     */
    public error (
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        error: any,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction
    ) {
        let responseObject: ResponseMessage<unknown>

        if (error.name === 'ParameterParseJsonError') {
            res.status(400)
            responseObject = new ResponseMessage(400, 'Invalid Request', null)
            return res.json(responseObject)
        }

        // if its an array of ValidationError
        if (error.errors && Array.isArray(error.errors) && error.errors.every((element: unknown) => element instanceof ValidationError)) {
            res.status(400)
            if (error.errors.length > 0) {
                const { constraints } = error.errors[0]
                const keys = Object.keys(constraints)
                responseObject = new ResponseMessage(400, constraints[keys[0]], constraints)
            } else {
                responseObject = new ResponseMessage(400, '', error)
            }
            responseObject.msg = 'Invalid Request'
            if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
                responseObject.msg = error
            }
            return res.json(responseObject)
        }
        if (error instanceof CustomErrorWithSlackNotification) {
            res.status(500)

            responseObject = new ResponseMessage(500, '요청을 처리하는 과정에서 오류가 발생했습니다.', null)
            return res.json(responseObject)
        }
        if (error instanceof HttpError) {
            if (error.httpCode) {
                res.status(error.httpCode)
            }
            let errorObject: ResponseMessage<unknown>

            if (error instanceof CustomHttpError) {
                errorObject = error.toJson()
            } else if (error instanceof UnauthorizedError) {
                errorObject = {
                    status: 401001,
                    msg: '해당 엔드포인트에 접근할 수 있는 권한이 없습니다'
                }
            } else {
                errorObject = {
                    status: 500001,
                    msg: '알 수 없는 오류가 발생했습니다'
                }
                if (env.isProduction) {
                    Slack.sendTextMessage(JSON.stringify(error), 'C02SE9VA8TC')
                } else {
                    Slack.sendTextMessage(JSON.stringify(error), 'C02TWKQHJ64')
                }
            }
            return res.json(errorObject)
        }
        const errorObject = {
            name: (error as Error).name,
            message: (error as Error).message,
            stack: (error as Error).stack,
            req: {
                query: _req.query,
                params: _req.params,
                body: _req.body,
                url: _req.url,
                baseUrl: _req.baseUrl,
                originUrl: _req.originalUrl,
                cookies: _req.cookies,
                method: _req.method
            }
        }
        console.error(errorObject)
        if (env.isProduction) {
            Slack.sendTextMessage(JSON.stringify(error), 'C02SE9VA8TC')
        } else {
            Slack.sendTextMessage(JSON.stringify(error), 'C02TWKQHJ64')
        }

        res.status(500)

        if (error instanceof Error) {
            responseObject = {
                status: 500,
                msg: error.message,
                data: undefined,
                arr: undefined
            }
        } else if (typeof error === 'string') {
            responseObject = {
                status: 500,
                msg: error,
                data: undefined,
                arr: undefined
            }
        } else {
            responseObject = {
                status: 500,
                msg: 'unknown error type',
                data: undefined,
                arr: undefined
            }
        }
        return res.json(responseObject)
    }
}
