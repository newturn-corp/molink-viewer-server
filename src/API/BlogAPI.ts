import axios from 'axios'
import env from '../env'
import {
    CreatePageInBlogInternalDTO, SaveBlogDTO,
    SaveBlogInternalDTO,
    SaveBlogResponseDTO,
    SetBlogNameDTO,
    AddBlogUserDTO, SetBlogProfileImageDTO
} from '@newturn-develop/types-molink'
import FormData from 'form-data'

export class BlogAPI {
    clientRequest: any

    constructor (request: any) {
        this.clientRequest = request
    }

    async saveBlog (dto: SaveBlogDTO): Promise<SaveBlogResponseDTO> {
        const res = await axios.post(`${env.api.url}/hierarchy/internal`, dto, {
            headers: {
                Cookie: `internal-api-key=${env.api.internalKey}`
            }
        })
        return res.data.data
    }

    async addBlogUser (dto: AddBlogUserDTO): Promise<void> {
        await axios.post(`${env.api.url}/hierarchy/internal/users`, dto, {
            headers: {
                Cookie: `internal-api-key=${env.api.internalKey}`
            }
        })
    }

    async setBlogName (dto: SetBlogNameDTO): Promise<void> {
        const res = await axios.put(`${env.api.url}/hierarchy/internal/name`, dto, {
            headers: {
                Cookie: `internal-api-key=${env.api.internalKey}`
            }
        })
        return res.data.data
    }

    // eslint-disable-next-line no-undef
    async setBlogProfileImage (dto: any): Promise<void> {
        const bodyFormData = new FormData()
        bodyFormData.append('image', dto.image, 'image.png')
        const res = await axios.put(`${env.api.url}/hierarchy/internal/${dto.blogID}/profile-image`, bodyFormData, {
            headers: {
                Cookie: `internal-api-key=${env.api.internalKey}`
            }
        })
        return res.data.data
    }

    async createPage (dto: CreatePageInBlogInternalDTO): Promise<void> {
        const res = await axios.post(`${env.api.url}/hierarchy/internal/pages`, dto, {
            headers: {
                Cookie: `internal-api-key=${env.api.internalKey}`
            }
        })
        return res.data.data
    }
}
