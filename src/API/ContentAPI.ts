import axios from 'axios'
import env from '../env'
import { CreatePageInternalDTO, CreatePageResponseDTO, GetDocumentAuthorityDTO } from '@newturn-develop/types-molink'

export class ContentAPI {
    clientRequest: any

    constructor (request: any) {
        this.clientRequest = request
    }

    async createPage (dto: CreatePageInternalDTO): Promise<CreatePageResponseDTO> {
        const res = await axios.post(`${env.api.url}/contents/internal/contents`, dto, {
            headers: {
                Cookie: `internal-api-key=${env.api.internalKey}`
            }
        })
        return res.data.data
    }
}
