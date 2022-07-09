import moment from 'moment-timezone'
import crypto from 'crypto'
import env from '../env'
import { GetFileSecurityDTO } from '@newturn-develop/types-molink'

class FileSecurityService {
    issueSecurity () {
        const policy = {
            expiry: Number(moment().add(3, 'days').toDate()),
            call: ['pick', 'store'],
            minSize: 128,
            maxSize: 5120000
        }
        const encodedPolicy = Buffer.from(JSON.stringify(policy)).toString('base64')
        const signature = crypto.createHmac('sha256', env.file.security_secret).update(encodedPolicy).digest('hex')
        return new GetFileSecurityDTO(encodedPolicy, signature)
    }
}
export default new FileSecurityService()
