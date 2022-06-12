import { Request } from 'express'
import { User } from '@newturn-develop/types-molink'
import CacheService from './CacheService'
import ViewLogRepo from '../Repositories/ViewLogRepo'
import ESPageRepo from '../Repositories/ESPageRepo'
import BlogViewLogRepo from '../Repositories/BlogViewLogRepo'

export class ViewLogService {
    // Viewlog 필터링 규칙
    // 1. 본인의 문서는 계산되지 않는다.
    // 2. 24시간 내의 같은 IP로 접속
    // 3. 24시간 내의 같은 ID로 접속
    async savePageViewLog (req: Request, user: User | null, pageID: string) {
        try {
            const pageMetaInfo = await ESPageRepo.getPageMetaInfo(pageID)
            if (!pageMetaInfo) {
                return
            }

            // 페이지의 사용자 아이디랑 조회한 사람의 ID랑 겹칠 경우, 저장하지 않는다.
            if (pageMetaInfo.userId === user?.id) {
                return
            }
            const ipList = req.headers['x-forwarded-for'] as string
            const ip = ipList.split(',')[0]
            const ipKey = `${ip}/${pageID}`
            const isIpDuplicated = !(await CacheService.main.setNxWithEx(ipKey, 'view', 86400))
            if (isIpDuplicated) {
                return
            }
            if (user) {
                const userKey = `${user.id}/${pageID}`
                const isUserDuplicated = !(await CacheService.main.setNxWithEx(userKey, 'view', 86400))
                if (isUserDuplicated) {
                    return
                }
            }
            const userAgent = req.useragent
            await ViewLogRepo.saveViewLog(pageID, pageMetaInfo.userId, user ? user.id : null, ip, userAgent)
        } catch (err) {
            console.log(err)
        }
    }

    // Viewlog 필터링 규칙
    // 1. 본인의 문서는 계산되지 않는다.
    // 2. 24시간 내의 같은 IP로 접속
    // 3. 24시간 내의 같은 ID로 접속
    async saveBlogViewLog (req: Request, user: User | null, blogID: number) {
        try {
            // 블로그의 사용자 아이디랑 조회한 사람의 ID랑 겹칠 경우, 저장하지 않는다.
            if (blogID === user?.id) {
                return
            }
            const ipList = req.headers['x-forwarded-for'] as string
            const ip = ipList.split(',')[0]
            const ipKey = `blog/${ip}/${blogID}`
            const isIpDuplicated = !(await CacheService.main.setNxWithEx(ipKey, 'view', 86400))
            if (isIpDuplicated) {
                return
            }
            if (user) {
                const userKey = `blog/${user.id}/${blogID}`
                const isUserDuplicated = !(await CacheService.main.setNxWithEx(userKey, 'view', 86400))
                if (isUserDuplicated) {
                    return
                }
            }
            const userAgent = req.useragent
            await BlogViewLogRepo.saveBlogViewLog(blogID, user ? user.id : null, ip, userAgent)
        } catch (err) {
            console.log(err)
        }
    }
}
