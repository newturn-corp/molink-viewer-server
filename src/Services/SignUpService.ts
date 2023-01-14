import crypto from 'crypto'
import env from '../env'

import UserRepo from '../Repositories/UserRepo'
import {
    BlogNameAlreadyExist,
    InvalidBlogName,
    InvalidEmail,
    InvalidNickname,
    InvalidPassword,
    NicknameAlreadyExist,
    TooManySignUpRequestWithSameID,
    TooManySignUpRequestWithSameIP, UserAlreadyAuthorized,
    UserAlreadyExists, UserNotExists
} from '../Errors/AuthError'
import EmailAuthRepo from '../Repositories/EmailAuthRepo'
import sendEmail from '../Utils/sendEmail'
import PasswordChangeRepo from '../Repositories/PasswordChangeRepo'
import { dataURLToBuffer, DateUtil, Slack } from '@newturn-develop/molink-utils'
import {
    AddBlogUserDTO, AddUserBlogDTO,
    AuthBlogNameStatus,
    AuthEmailStatus,
    AuthNicknameStatus,
    CreatePageInBlogInternalDTO,
    CreatePageInternalDTO,
    GetBlogNameStatusResponseDTO,
    GetEmailStatusResponseDTO,
    GetNicknameStatusResponseDTO,
    SaveBlogDTO,
    SaveUserInternalDTO, SendSignUpAuthEmailDTO, SetBlogProfileImageDTO, SetUserProfileImageInternalDTO,
    SignUpDTO
} from '@newturn-develop/types-molink'
import { ContentAPI } from '../API/ContentAPI'
import { getTutorialPage } from '../Utils/getTutorialPage'
import { BlogAPI } from '../API/BlogAPI'
import { UserAPI } from '../API/UserAPI'
import BlogRepo from '../Repositories/BlogRepo'
import AuthValidator from './AuthValidator'
import Identicon from 'identicon.js'
import randomColor from 'randomcolor'

export class SignUpService {
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

    async getEmailStatus (email: string) {
        if (!AuthValidator.validateEmail(email)) {
            return new GetEmailStatusResponseDTO(AuthEmailStatus.InvalidEmail)
        }
        const existingUser = await UserRepo.getActiveUserByEmail(email)
        if (!existingUser) {
            return new GetEmailStatusResponseDTO(AuthEmailStatus.NotExists)
        }
        if (existingUser.is_email_auth) {
            return new GetEmailStatusResponseDTO(AuthEmailStatus.AlreadyAuthed)
        } else {
            return new GetEmailStatusResponseDTO(AuthEmailStatus.Validating)
        }
    }

    async getNicknameStatus (nickname: string) {
        if (!AuthValidator.validateNickname(nickname)) {
            return new GetNicknameStatusResponseDTO(AuthNicknameStatus.InvalidNickname)
        }
        const existingUser = await UserRepo.getActiveUserByNickname(nickname)
        if (existingUser) {
            return new GetNicknameStatusResponseDTO(AuthNicknameStatus.AlreadyExists)
        }
        return new GetNicknameStatusResponseDTO(AuthNicknameStatus.NotExists)
    }

    async getBlogNameStatus (blogName: string) {
        if (!AuthValidator.validateBlogName(blogName)) {
            return new GetBlogNameStatusResponseDTO(AuthBlogNameStatus.InvalidBlogName)
        }
        const existingBlog = await BlogRepo.getActiveBlogByBlogName(blogName)
        if (existingBlog) {
            return new GetBlogNameStatusResponseDTO(AuthBlogNameStatus.AlreadyExists)
        }
        return new GetBlogNameStatusResponseDTO(AuthBlogNameStatus.NotExists)
    }

    getAuthEmailHTML (url: string) {
        return `인증 링크는 <b>1시간</b>동안 유효합니다!<br><a href="${url}" target="child">여기를 눌러 인증을 완료해주세요!</a>`
    }

    async sendSignUpAuthEmail (dto: SendSignUpAuthEmailDTO, ip: string) {
        const { email } = dto
        const sameIPRequests = await EmailAuthRepo.getActiveEmailAuthListByIP(ip, DateUtil.nowBuilder().subMinute(15).build())
        if (sameIPRequests.length > 5) {
            throw new TooManySignUpRequestWithSameIP()
        }
        const existingUser = await UserRepo.getActiveUserByEmail(email)
        if (!existingUser) {
            throw new UserNotExists()
        }
        // 이미 해당 유저가 인증을 받았다면, UserAlreadyExists Error를 return한다.
        if (existingUser.is_email_auth) {
            throw new UserAlreadyAuthorized()
        }
        // 같은 ID로 15분 내에 5회 초과 요청이 들어왔다면, TooManySignUpRequestWithSameIP Error를 return한다.
        const sameIDRequests = await EmailAuthRepo.getEmailAuthListByUserId(existingUser.id, DateUtil.nowBuilder().subMinute(15).build())
        if (sameIDRequests.length > 5) {
            throw new TooManySignUpRequestWithSameID()
        }
        await EmailAuthRepo.setExpiredByUserId(existingUser.id)
        await this._authByEmail(existingUser.id, ip, email)
    }

    private async _authByEmail (userId: number, ip: string, email: string) {
        const salt = crypto.randomBytes(64).toString('base64')
        const pwdKey = crypto.pbkdf2Sync(`${userId},${ip}`, salt, 10000, 64, 'sha512')
        const hash = pwdKey.toString('base64url')
        const url = `${env.front_origin}/auth/email-auth?key=${hash}`
        await sendEmail(email, 'Molink 이메일 인증', this.getAuthEmailHTML(url))
        await EmailAuthRepo.saveEmailAuth(userId, ip, hash)
    }

    async signUpByEmail (ip: string, dto: SignUpDTO) {
        // 2. 동일한 IP로 15분 이내에 5회 초과 요청
        const sameIPRequests = await EmailAuthRepo.getActiveEmailAuthListByIP(ip, DateUtil.nowBuilder().subMinute(15).build())
        if (sameIPRequests.length > 5) {
            throw new TooManySignUpRequestWithSameIP()
        }

        const { email, pwd, nickname, isAcceptMarketing, blogName } = dto
        // 1. 이메일과 패스워드 값이 서버가 요구하는 조건에 맞지 않은 경우 처리
        // 이 코드는 프론트와 같은 판별 조건을 유지해야 한다.
        if (!this.validateEmail(email)) {
            throw new InvalidEmail()
        }
        if (!this.validatePassword(pwd)) {
            throw new InvalidPassword()
        }
        if (!this.validateNickname(nickname)) {
            throw new InvalidNickname()
        }
        if (!this.validateBlogName(nickname)) {
            throw new InvalidBlogName()
        }

        // 3. 이미 유저가 존재하는 경우
        const existingUser = await UserRepo.getActiveUserByEmail(email)
        if (existingUser) {
            // 이미 해당 유저가 인증을 받았다면, UserAlreadyExists Error를 return한다.
            if (existingUser.is_email_auth) {
                const error = new UserAlreadyExists()
                throw error
            }
            // 같은 Id로 15분 내에 5회 초과 요청이 들어왔다면, TooManySignUpRequestWithSameIP Error를 return한다.
            const sameIdRequests = await EmailAuthRepo.getEmailAuthListByUserId(existingUser.id, DateUtil.nowBuilder().subMinute(15).build())
            if (sameIdRequests.length > 5) {
                throw new TooManySignUpRequestWithSameID()
            }
            // 기존에 존재한 이메일 인증을 만료하고 새로운 이메일 인증을 생성한다.
            await EmailAuthRepo.setExpiredByUserId(existingUser.id)
            const {
                salt, hash
            } = this._hashPwd(pwd)
            await UserRepo.setUserPwdAndSalt(existingUser.id, hash, salt)
            await this._authByEmail(existingUser.id, ip, email)
        } else {
            const sameNicknameUser = await UserRepo.getActiveUserByNickname(nickname)
            if (sameNicknameUser) {
                throw new NicknameAlreadyExist()
            }
            const sameNameBlog = await BlogRepo.getActiveBlogByBlogName(blogName)
            if (sameNameBlog) {
                throw new BlogNameAlreadyExist()
            }

            const { userID } = await this.userAPI.saveUser(new SaveUserInternalDTO(email, nickname, pwd, isAcceptMarketing))
            const { blogID } = await this.blogAPI.saveBlog(new SaveBlogDTO(blogName))

            const profileImage = this.getProfileImageByNickname(nickname)
            await this.userAPI.setUserProfileImageURL({
                userID,
                image: profileImage
            })
            await this.blogAPI.setBlogProfileImage({
                blogID,
                image: profileImage
            })

            await this.userAPI.addUserBlog(userID, new AddUserBlogDTO(blogID))
            await this.blogAPI.addBlogUser(new AddBlogUserDTO(userID, blogID, true, true))
            const initialContentID = await this.saveInitialContent(userID, blogID, nickname)
            await this.blogAPI.createPage(new CreatePageInBlogInternalDTO(initialContentID, blogID, '새 페이지', '📄', 0, null, userID))

            await this._authByEmail(userID, ip, email)

            await Slack.sendTextMessage(`신규 가입!\n${userID}\n${nickname}`, env.isProduction ? 'C035QPGD56J' : 'C03JC0P1UFN')
        }
    }

    getProfileImageByNickname (nickname: string) {
        const color = [...randomColor({
            luminosity: 'light',
            alpha: 1,
            format: 'rgbArray'
        }) as any, 255] as [number, number, number, number]
        return dataURLToBuffer(`data:image/png;base64,${
            new Identicon(
                crypto.createHash('sha512')
                    .update(nickname)
                    .digest('base64'), {
                    size: 64,
                    foreground: color,
                    background: [250, 250, 250, 255]
                }).toString()}`)
    }

    async saveInitialContent (userID: number, blogID: number, nickname: string) {
        const stringifyContent = JSON.stringify(getTutorialPage(nickname))
        const dto = await this.contentAPI.createPage(new CreatePageInternalDTO(null, stringifyContent, '시작하기', null, blogID, userID))
        return dto.id
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

    async checkPasswordChangeExist (hash: string) {
        const change = await PasswordChangeRepo.getPasswordChangeByHashkey(hash, DateUtil.nowBuilder().subMinute(15).build())
        return !!change
    }
}
