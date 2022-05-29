import axios from 'axios'
import env from '../env'
import { GetDocumentAuthorityDTO } from '@newturn-develop/types-molink'

export class ViewerAPI {
    clientRequest: any

    constructor (request: any) {
        this.clientRequest = request
    }

    async getPageAuthority (pageId: string): Promise<GetDocumentAuthorityDTO> {
        const config = this.clientRequest.cookies.token
            ? {
                headers: {
                    Cookie: `token=${this.clientRequest.cookies.token}`
                }
            }
            : undefined
        const res = await axios.get(`${env.api.url}/viewer/pages/${pageId}/authority`, config)
        return res.data.data
    }
}
