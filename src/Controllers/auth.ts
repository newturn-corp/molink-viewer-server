import { Body, JsonController, Post, Put, Req, Res, Authorized, Delete, Param, Get } from 'routing-controllers'
import { ChangePasswordDto, SaveChangePasswordDto, SignInDto, VerifyEmailDto } from '../DTO/AuthDto'
import { makeEmptyResponseMessage, makeResponseMessage } from '../DTO/Common'
import { AuthService } from '../Services/AuthService'
import { Request, Response } from 'express'
import { CookieConfig } from '../Configs/CookieConfig'
import { CustomHttpError } from '../Errors/HttpError'
import {
    ExpiredEmailAuth,
    TooManyLoginAttempt,
    UserAccountNotExist,
    UserAlreadyExists,
    WrongEmailOrPassword,
    EmailUnauthorized,
    InvalidEmail,
    InvalidPassword,
    TooManySignUpRequestWithSameIP,
    TooManySignUpRequestWithSameID,
    UserNotExists,
    TooManyPasswordChangeRequestWithSameID,
    TooManyPasswordChangeRequestWithSameIP,
    PasswordChangeNotExist,
    InvalidNickname,
    NicknameAlreadyExist,
    TooManyEmailAuthRequest, InvalidBlogName, BlogNameAlreadyExist, UserAlreadyAuthorized
} from '../Errors/AuthError'
import { DateUtil } from '@newturn-develop/molink-utils'
import { SendSignUpAuthEmailDTO, SignUpDTO } from '@newturn-develop/types-molink'
import { ContentAPI } from '../API/ContentAPI'
import { BlogAPI } from '../API/BlogAPI'
import { UserAPI } from '../API/UserAPI'
import { SignUpService } from '../Services/SignUpService'

@JsonController('/auth')
export class AuthController {
    @Get('/health-check')
    async checkServerStatus () {
        return makeEmptyResponseMessage(200)
    }

    @Post('/sign-up')
    async signUp (@Body() dto: SignUpDTO, @Req() req: Request) {
        try {
            const ip = req.headers['x-real-ip'] as string
            const service = new SignUpService(new ContentAPI(req), new BlogAPI(req), new UserAPI(req))
            await service.signUpByEmail(ip, dto)
            return makeEmptyResponseMessage(201)
        } catch (err) {
            if (err instanceof UserAlreadyExists) {
                throw new CustomHttpError(409, 1, '해당 이메일을 가진 유저가 이미 존재합니다.')
            } else if (err instanceof InvalidEmail) {
                throw new CustomHttpError(409, 2, '이메일 형식이 맞지 않습니다.')
            } else if (err instanceof InvalidPassword) {
                throw new CustomHttpError(409, 3, '패스워드 형식이 맞지 않습니다.')
            } else if (err instanceof TooManySignUpRequestWithSameIP || err instanceof TooManySignUpRequestWithSameID) {
                throw new CustomHttpError(409, 4, '가입 요청을 너무 많이 하셨습니다.')
            } else if (err instanceof InvalidNickname) {
                throw new CustomHttpError(409, 5, '닉네임 형식이 맞지 않습니다.')
            } else if (err instanceof NicknameAlreadyExist) {
                throw new CustomHttpError(409, 6, '닉네임이 이미 존재합니다.')
            } else if (err instanceof InvalidBlogName) {
                throw new CustomHttpError(409, 7, '블로그 이름 형식이 맞지 않습니다.')
            } else if (err instanceof BlogNameAlreadyExist) {
                throw new CustomHttpError(409, 8, '블로그 이름이 이미 존재합니다.')
            } else {
                throw err
            }
        }
    }

    @Get('/email-status/:email')
    async getEmailStatus (@Req() req: Request, @Param('email') email: string) {
        const service = new SignUpService(new ContentAPI(req), new BlogAPI(req), new UserAPI(req))
        const dto = await service.getEmailStatus(email)
        return makeResponseMessage(200, dto)
    }

    @Get('/nickname-status/:nickname')
    async getNicknameStatus (@Req() req: Request, @Param('nickname') nickname: string) {
        const service = new SignUpService(new ContentAPI(req), new BlogAPI(req), new UserAPI(req))
        const dto = await service.getNicknameStatus(nickname)
        return makeResponseMessage(200, dto)
    }

    @Get('/blog-name-status/:blogName')
    async getBlogNameStatus (@Req() req: Request, @Param('blogName') blogName: string) {
        const service = new SignUpService(new ContentAPI(req), new BlogAPI(req), new UserAPI(req))
        const dto = await service.getBlogNameStatus(blogName)
        return makeResponseMessage(200, dto)
    }

    @Post('/send-sign-up-auth-email')
    async sendSignUpAuthEmail (@Req() req: Request, @Body() dto: SendSignUpAuthEmailDTO) {
        try {
            const ip = req.headers['x-real-ip'] as string
            const service = new SignUpService(new ContentAPI(req), new BlogAPI(req), new UserAPI(req))
            await service.sendSignUpAuthEmail(dto, ip)
            return makeResponseMessage(201, dto)
        } catch (err) {
            if (err instanceof TooManySignUpRequestWithSameIP) {
                throw new CustomHttpError(409, 1, '너무 많이 요청했습니다. 잠시 뒤 다시 시도해주세요.')
            } else if (err instanceof UserNotExists) {
                throw new CustomHttpError(404, 1, '사용자가 존재하지 않습니다.')
            } else if (err instanceof UserAlreadyAuthorized) {
                throw new CustomHttpError(409, 2, '이미 인증을 받은 사용자입니다.')
            } else if (err instanceof TooManySignUpRequestWithSameID) {
                throw new CustomHttpError(409, 3, '너무 많이 요청했습니다. 잠시 뒤 다시 시도해주세요.')
            } else {
                throw err
            }
        }
    }

    @Put('/sign-in')
    async signIn (@Body() dto: SignInDto, @Req() req: Request, @Res() res: Response) {
        try {
            const ip = req.headers['x-real-ip'] as string
            const service = new AuthService(new ContentAPI(req), new BlogAPI(req), new UserAPI(req))
            const token = await service.signInByEmail(dto, ip)
            res.cookie('token', token, {
                ...CookieConfig,
                expires: DateUtil.nowBuilder().addDay(31).build()
            })
            return makeResponseMessage(200, {})
        } catch (err) {
            if (err instanceof UserAccountNotExist || err instanceof WrongEmailOrPassword) {
                throw new CustomHttpError(404, 1, '이메일 혹은 비밀번호가 일치하지 않습니다.')
            } else if (err instanceof TooManyLoginAttempt) {
                throw new CustomHttpError(403, 1, '허용 가능한 로그인 시도 횟수를 넘었습니다.')
            } else if (err instanceof EmailUnauthorized) {
                throw new CustomHttpError(409, 1, '이메일이 인증되지 않았습니다.')
            } else if (err instanceof TooManyEmailAuthRequest) {
                throw new CustomHttpError(409, 2, '이메일이 인증되지 않았습니다.')
            } else {
                throw err
            }
        }
    }

    @Put('/verify-email')
    async verifyEmail (@Body() dto: VerifyEmailDto, @Req() req: Request) {
        try {
            const service = new AuthService(new ContentAPI(req), new BlogAPI(req), new UserAPI(req))
            await service.verifyEmail(dto.hash)
            return makeEmptyResponseMessage(200)
        } catch (err) {
            if (err instanceof ExpiredEmailAuth) {
                throw new CustomHttpError(409, 1, '이미 만료된 인증입니다.')
            } else {
                throw err
            }
        }
    }

    @Post('/password-change')
    async startPasswordChange (@Body() dto: SaveChangePasswordDto, @Req() req: Request) {
        try {
            const { ip } = req
            const service = new AuthService(new ContentAPI(req), new BlogAPI(req), new UserAPI(req))
            await service.savePasswordChange(ip, dto)
            return makeEmptyResponseMessage(201)
        } catch (err) {
            if (err instanceof InvalidEmail) {
                throw new CustomHttpError(409, 1, '잘못된 이메일 형식입니다.')
            } else if (err instanceof UserNotExists) {
                throw new CustomHttpError(409, 2, '유저가 존재하지 않습니다.')
            } else if (err instanceof TooManyPasswordChangeRequestWithSameID || err instanceof TooManyPasswordChangeRequestWithSameIP) {
                throw new CustomHttpError(409, 3, '비밀번호 변경 요청을 너무 많이 하셨습니다.')
            } else {
                throw err
            }
        }
    }

    @Get('/password-change/:hash')
    async checkPasswordChangeExist (@Param('hash') hash: string, @Req() req: Request) {
        const service = new AuthService(new ContentAPI(req), new BlogAPI(req), new UserAPI(req))
        const exist = await service.checkPasswordChangeExist(hash)
        return makeResponseMessage(200, { exist })
    }

    @Put('/password-change')
    async changePassword (@Body() dto: ChangePasswordDto, @Req() req: Request) {
        try {
            const service = new AuthService(new ContentAPI(req), new BlogAPI(req), new UserAPI(req))
            await service.changePassword(dto)
            return makeEmptyResponseMessage(200)
        } catch (err) {
            if (err instanceof PasswordChangeNotExist) {
                throw new CustomHttpError(409, 1, '비밀번호 변경 요청 기록이 존재하지 않습니다.')
            } else if (err instanceof InvalidPassword) {
                throw new CustomHttpError(409, 2, '비밀번호 형식에 문제가 있습니다.')
            } else {
                throw err
            }
        }
    }

    @Delete('/sign-out')
    @Authorized()
    async signOut (@Res() res: Response) {
        res.clearCookie('token', CookieConfig)
        return makeEmptyResponseMessage(200)
    }

    @Get('/random-nickname')
    async getRandomNickname (@Req() req: Request) {
        const service = new AuthService(new ContentAPI(req), new BlogAPI(req), new UserAPI(req))
        const dto = await service.getRandomNickname(req)
        return makeResponseMessage(200, dto)
    }
}

export default MainController
