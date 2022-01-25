import { DocumentVisibility } from '../Domains/Document'
import DocumentAuthority from '../Domains/DocumentAuthority'

export class GetDocumentViewInfoResponseDTO {
    id: string = ''
    title: string = ''
    icon: string = ''
    userId: number = 0
    visibility: DocumentVisibility = DocumentVisibility.Private
    createdAt: Date = new Date()
    updatedAt: Date = new Date()
    authority: DocumentAuthority
    content: any = null

    constructor (authority: DocumentAuthority) {
        this.authority = authority
    }
}
