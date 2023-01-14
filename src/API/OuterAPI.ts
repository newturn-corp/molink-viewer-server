import axios from 'axios'
import env from '../env'
import { GetDocumentAuthorityDTO } from '@newturn-develop/types-molink'

export class OuterAPI {
    clientRequest: any

    constructor (request: any) {
        this.clientRequest = request
    }

    async getRandomNickname () {
        const config = {
            headers: {
                Cookie: ''
            }
        }
        const res = await axios.get('https://nickname.hwanmoo.kr/?format=json&count=1&max_length=10', config)
        return res.data
    }
}
