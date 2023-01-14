class AuthValidator {
    validateEmail (email: string) {
        // eslint-disable-next-line prefer-regex-literals
        const emailReg = new RegExp(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i)
        return emailReg.test(email)
    }

    validatePassword (pwd: string) {
        // eslint-disable-next-line prefer-regex-literals
        const pwdReg = new RegExp(/^.*(?=^.{8,300}$)(?=.*\d)(?=.*[a-zA-Z]).*$/)
        return pwdReg.test(pwd)
    }

    validateNickname (nickname: string) {
        if (nickname.length < 2 || nickname.length > 20) {
            return false
        }
        const nicknameReg = /^([ㄱ-ㅎㅏ-ㅣ-가-힣A-Za-z0-9_\s-](?:(?:[ㄱ-ㅎㅏ-ㅣ-가-힣A-Za-z0-9_\s-]|(?:\.(?!\.))){0,28}(?:[ㄱ-ㅎㅏ-ㅣ-가-힣A-Za-z0-9_\s-]))?)$/
        return nicknameReg.test((nickname))
    }

    validateBlogName (blogName: string) {
        if (blogName.length < 2 || blogName.length > 20) {
            return false
        }
        const nicknameReg = /^([ㄱ-ㅎㅏ-ㅣ-가-힣A-Za-z0-9_\s-](?:(?:[ㄱ-ㅎㅏ-ㅣ-가-힣A-Za-z0-9_\s-]|(?:\.(?!\.))){0,28}(?:[ㄱ-ㅎㅏ-ㅣ-가-힣A-Za-z0-9_\s-]))?)$/
        return nicknameReg.test((blogName))
    }
}
export default new AuthValidator()
