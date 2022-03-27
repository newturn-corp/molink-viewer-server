import User from '../Domains/User'
import ContentRepo from '../Repositories/ContentRepo'
import {
    GetContentResponseDTO
} from '@newturn-develop/types-molink'
import { ContentNotExists, UnauthorizedForContent } from '../Errors/ContentError'
import * as Y from 'yjs'
import AuthorityService from './AuthorityService'

class ContentService {
    public async getContent (viewer: User, documentId: string) {
        const authority = await AuthorityService.getPageAuthorityByPageId(viewer, documentId)
        if (!authority.viewable) {
            throw new UnauthorizedForContent()
        }
        const content = await ContentRepo.getContent(documentId)
        if (!content) {
            throw new ContentNotExists()
        }
        return new GetContentResponseDTO(Array.from(Y.encodeStateAsUpdate(content)))
    }
}
export default new ContentService()
