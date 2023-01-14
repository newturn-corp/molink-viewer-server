import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import env from '../env'
import { ChangePasswordDto, SaveChangePasswordDto, SignInDto } from '../DTO/AuthDto'

import UserRepo from '../Repositories/UserRepo'
import {
    BlogNameAlreadyExist,
    EmailUnauthorized,
    ExpiredEmailAuth, InvalidBlogName,
    InvalidEmail,
    InvalidNickname,
    InvalidPassword,
    NicknameAlreadyExist,
    PasswordChangeNotExist,
    TooManyEmailAuthRequest,
    TooManyLoginAttempt,
    TooManyPasswordChangeRequestWithSameID,
    TooManyPasswordChangeRequestWithSameIP,
    TooManySignUpRequestWithSameID,
    TooManySignUpRequestWithSameIP,
    UserAccountNotExist,
    UserAlreadyExists,
    UserNotExists,
    WrongEmailOrPassword
} from '../Errors/AuthError'
import EmailAuthRepo from '../Repositories/EmailAuthRepo'
import sendEmail from '../Utils/sendEmail'
import PasswordChangeRepo from '../Repositories/PasswordChangeRepo'
import { DateUtil, Slack } from '@newturn-develop/molink-utils'
import {
    GetRandomNicknameResponseDTO
} from '@newturn-develop/types-molink'
import { OuterAPI } from '../API/OuterAPI'
import { Request } from 'express'
import { ContentAPI } from '../API/ContentAPI'
import { BlogAPI } from '../API/BlogAPI'
import { UserAPI } from '../API/UserAPI'

export class AuthService {
    contentAPI: ContentAPI
    blogAPI: BlogAPI
    userAPI: UserAPI

    constructor (contentAPI: ContentAPI, blogAPI: BlogAPI, userAPI: UserAPI) {
        this.contentAPI = contentAPI
        this.blogAPI = blogAPI
        this.userAPI = userAPI
    }

    private validateEmail (email: string) {
        // eslint-disable-next-line prefer-regex-literals
        const emailReg = new RegExp(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i)
        return emailReg.test(email)
    }

    private validatePassword (pwd: string) {
        // eslint-disable-next-line prefer-regex-literals
        const pwdReg = new RegExp(/^.*(?=^.{8,300}$)(?=.*\d)(?=.*[a-zA-Z]).*$/)
        return pwdReg.test(pwd)
    }

    private validateNickname (nickname: string) {
        if (nickname.length < 2 || nickname.length > 20) {
            return false
        }
        const nicknameReg = /^([ㄱ-ㅎㅏ-ㅣ-가-힣A-Za-z0-9_\s-](?:(?:[ㄱ-ㅎㅏ-ㅣ-가-힣A-Za-z0-9_\s-]|(?:\.(?!\.))){0,28}(?:[ㄱ-ㅎㅏ-ㅣ-가-힣A-Za-z0-9_\s-]))?)$/
        return nicknameReg.test((nickname))
    }

    private validateBlogName (blogName: string) {
        if (blogName.length < 2 || blogName.length > 20) {
            return false
        }
        const nicknameReg = /^([ㄱ-ㅎㅏ-ㅣ-가-힣A-Za-z0-9_\s-](?:(?:[ㄱ-ㅎㅏ-ㅣ-가-힣A-Za-z0-9_\s-]|(?:\.(?!\.))){0,28}(?:[ㄱ-ㅎㅏ-ㅣ-가-힣A-Za-z0-9_\s-]))?)$/
        return nicknameReg.test((blogName))
    }

    getAuthEmailHTML (url: string) {
        return `인증 링크는 <b>1시간</b>동안 유효합니다!<br><a href="${url}" target="child">여기를 눌러 인증을 완료해주세요!</a>`
    }

    getChangePasswordEmailHTML (url: string) {
        return `<a href="${url}" target="child">여기를 눌러 비밀번호 변경을 완료해주세요!</a>`
    }

    private async authByEmail (userId: number, ip: string, email: string) {
        const salt = crypto.randomBytes(64).toString('base64')
        const pwdKey = crypto.pbkdf2Sync(`${userId},${ip}`, salt, 10000, 64, 'sha512')
        const hash = pwdKey.toString('base64url')
        const url = `${env.front_origin}/auth/email-auth?key=${hash}`
        await sendEmail(email, 'Molink 이메일 인증', this.getAuthEmailHTML(url))
        await EmailAuthRepo.saveEmailAuth(userId, ip, hash)
    }

    private async changePasswordByEmail (userId: number, ip: string, email: string) {
        const salt = crypto.randomBytes(64).toString('base64')
        const pwdKey = crypto.pbkdf2Sync(`${userId},${ip},${email}`, salt, 10000, 64, 'sha512')
        const hash = pwdKey.toString('base64url')
        const url = `${env.front_origin}/auth/change-password?key=${hash}`
        await sendEmail(email, 'Molink 비밀번호 변경', this.getChangePasswordEmailHTML(url))
        await PasswordChangeRepo.savePasswordChange(userId, ip, hash)
    }

    private _hashPwd (pwd: string) {
        const pwdBuf = crypto.randomBytes(64)
        const pwdSalt = pwdBuf.toString('base64')
        const pwdKey = crypto.pbkdf2Sync(pwd, pwdSalt, 100000, 64, 'sha512')
        const hashedPwd = pwdKey.toString('base64')
        return {
            salt: pwdSalt,
            hash: hashedPwd
        }
    }

    private _authWithPwd (inputPwd: string, hashedPwd: string, salt: string) {
        return crypto.pbkdf2Sync(inputPwd, salt, 100000, 64, 'sha512').toString('base64') === hashedPwd
    }

    async signInByEmail (dto: SignInDto, ip: string) {
        const user = await UserRepo.getActiveUserByEmail(dto.email)
        if (!user) {
            throw new UserAccountNotExist()
        }
        if (user.login_attempt_count > 5) {
            throw new TooManyLoginAttempt()
        }
        await UserRepo.setUserLoginAttemptCount(user.id, user.login_attempt_count + 1)
        if (!this._authWithPwd(dto.pwd, user.pwd, user.pwd_salt)) {
            throw new WrongEmailOrPassword()
        }
        if (!user.is_email_auth) {
            // 기존에 존재한 이메일 인증을 만료하고 새로운 이메일 인증을 생성한다.
            const auths = await EmailAuthRepo.getEmailAuthListByUserId(user.id, DateUtil.nowBuilder().subHour(3).build())
            if (auths.length > 5) {
                throw new TooManyEmailAuthRequest()
            }
            await EmailAuthRepo.setExpiredByUserId(user.id)
            await this.authByEmail(user.id, ip, user.email)
            throw new EmailUnauthorized()
        }
        await UserRepo.setUserLogin(user.id, DateUtil.now())
        const secretOrPrivateKey = env.jwt

        const token = jwt.sign({
            id: user.id,
            email: dto.email
        }, secretOrPrivateKey)
        await UserRepo.setUserJwt(user.id, token)
        return token
    }

    async verifyEmail (hash: string) {
        const authValidateTime = DateUtil.nowBuilder().subMinute(60).build()
        const emailAuth = await EmailAuthRepo.getEmailAuthByHashkey(hash, authValidateTime)
        if (!emailAuth || emailAuth.is_expired || authValidateTime > emailAuth.created_at) {
            throw new ExpiredEmailAuth()
        }
        await EmailAuthRepo.setSucceeded(emailAuth.id)
        await UserRepo.setUserEmailAuth(emailAuth.user_id)
    }

    async savePasswordChange (ip: string, dto: SaveChangePasswordDto) {
        const { email } = dto
        if (!this.validateEmail(email)) {
            throw new InvalidEmail()
        }

        const user = await UserRepo.getActiveUserByEmail(dto.email)
        if (!user) {
            throw new UserNotExists()
        }

        const sameIPRequests = await PasswordChangeRepo.getActivePasswordChangesByIP(ip, DateUtil.nowBuilder().subMinute(15).build())
        if (sameIPRequests.length > 5) {
            throw new TooManyPasswordChangeRequestWithSameIP()
        }

        const sameIdRequests = await PasswordChangeRepo.getActivePasswordChangesByID(user.id, DateUtil.nowBuilder().subMinute(15).build())
        if (sameIdRequests.length > 5) {
            throw new TooManyPasswordChangeRequestWithSameID()
        }

        // 기존에 존재한 비밀번호 변경을 expire하고 새로운 이메일 인증을 생성한다.
        await PasswordChangeRepo.setExpiredByUserId(user.id)
        await this.changePasswordByEmail(user.id, ip, email)
    }

    async checkPasswordChangeExist (hash: string) {
        const change = await PasswordChangeRepo.getPasswordChangeByHashkey(hash, DateUtil.nowBuilder().subMinute(15).build())
        return !!change
    }

    async changePassword (dto: ChangePasswordDto) {
        const { pwd, hash } = dto
        const change = await PasswordChangeRepo.getPasswordChangeByHashkey(hash, DateUtil.nowBuilder().subMinute(15).build())
        if (!change) {
            throw new PasswordChangeNotExist()
        }

        if (!this.validatePassword(pwd)) {
            throw new InvalidPassword()
        }

        const { salt, hash: hashedPwd } = this._hashPwd(pwd)
        await UserRepo.setUserPwdAndSalt(change.user_id, hashedPwd, salt)
    }

    async getRandomNickname (req: Request) {
        const api = new OuterAPI(req)
        const data = await api.getRandomNickname()
        return new GetRandomNicknameResponseDTO(data.words[0])
    }
}
