import { Request } from 'express'
import { User } from '@newturn-develop/types-molink'

export class ViewLogService {
    // Viewlog 필터링 규칙
    // 1. 본인의 문서는 계산되지 않는다.
    // 2. 24시간 내의 같은 IP로 접속
    // 3. 24시간 내의 같은 ID로 접속
    async saveViewLog (req: Request, user: User, documentId: string) {
        // const document = await DocumentRepo.getDocument(documentId)
        // if (!document) {
        //     return
        // }
        // if (document.userId === user.id) {
        //     return
        // }
        // const ipList = req.headers['x-forwarded-for'] as string
        // const ip = ipList.split(',')[0]
        // const ipKey = `${ip}/${documentId}`
        // const isIpDuplicated = !(await RedisConnector.setNxWithEx(ipKey, 'view', 86400))
        // if (isIpDuplicated) {
        //     return
        // }
        // if (user) {
        //     const userKey = `${user.id}/${documentId}`
        //     const isUserDuplicated = !(await RedisConnector.setNxWithEx(userKey, 'view', 86400))
        //     console.log(isUserDuplicated)
        //     if (isUserDuplicated) {
        //         return
        //     }
        // }
        // const userAgent = req.useragent
        // await ViewLogRepo.saveViewLog(documentId, user ? user.id : null, ip, userAgent)
    }
}
