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

export class DocumentHierarchyDTO {
    id: string
    title: string
    icon: string
    order: number
    parentId: string | null
    isChildrenOpen: boolean

    constructor (id: string, title: string, icon: string, order: number, parentId: string | null, isChildrenOpen: boolean) {
        this.id = id
        this.title = title
        this.icon = icon
        this.order = order
        this.parentId = parentId
        this.isChildrenOpen = isChildrenOpen
    }
}

export class DocumentGeneralHierarchyInfo {
    id: string
    title: string
    icon: string
    userId: number
    visiblity: DocumentVisibility
    order: number
    parentId: string | null

    constructor (id: string, title: string, icon: string, userId: number, visiblity: DocumentVisibility, order: number, parentId: string | null) {
        this.id = id
        this.title = title
        this.icon = icon
        this.userId = userId
        this.visiblity = visiblity
        this.order = order
        this.parentId = parentId
    }
}
