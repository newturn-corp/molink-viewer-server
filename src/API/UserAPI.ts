import axios from 'axios'
import env from '../env'
import {
    AddUserBlogDTO,
    SaveUserInternalDTO,
    SaveUserResponseInternalDTO,
    SetUserProfileImageInternalDTO
} from '@newturn-develop/types-molink'
import FormData from 'form-data'

export class UserAPI {
    clientRequest: any

    constructor (request: any) {
        this.clientRequest = request
    }

    async saveUser (dto: SaveUserInternalDTO): Promise<SaveUserResponseInternalDTO> {
        const res = await axios.post(`${env.api.url}/users/internal`, dto, {
            headers: {
                Cookie: `internal-api-key=${env.api.internalKey}`
            }
        })
        return res.data.data
    }

    async setUserProfileImageURL (dto: any): Promise<void> {
        const bodyFormData = new FormData()
        bodyFormData.append('image', dto.image, 'image.png')
        const res = await axios.put(`${env.api.url}/users/internal/${dto.userID}/profile-image`, bodyFormData, {
            headers: {
                Cookie: `internal-api-key=${env.api.internalKey}`
            }
        })
        return res.data.data
    }

    async addUserBlog (userID: number, dto: AddUserBlogDTO): Promise<void> {
        const res = await axios.put(`${env.api.url}/users/internal/${userID}/add-user-blog`, dto, {
            headers: {
                Cookie: `internal-api-key=${env.api.internalKey}`
            }
        })
        return res.data.data
    }
}
