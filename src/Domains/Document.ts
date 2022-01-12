export enum DocumentVisibility {
    Private = 0,
    OnlyFollower = 1,
    Public = 2
}

export interface DocumentSelection {
    path: number[],
    offset: number
}

export default class Document {
    id: string
    userId: number
    title: string
    icon: string
    order: number
    isChildrenOpen: boolean
    parentId: string | null
    children: Document[] = []
    visibility: DocumentVisibility
    createdAt: Date
    updatedAt: Date
    contentId: string
    representative: boolean
    selection: DocumentSelection | null
    isLocked: boolean

    constructor (id: string, userId: number, title: string, icon: string, order: number, isChildrenOpen: boolean, parentId: string | null, visibility: DocumentVisibility, createdAt: Date, updatedAt: Date, contentId: string, representative: boolean, selection: DocumentSelection | null, isLocked: boolean) {
        this.id = id
        this.userId = userId
        this.title = title
        this.icon = icon
        this.order = order
        this.isChildrenOpen = isChildrenOpen
        this.parentId = parentId
        this.visibility = visibility
        this.createdAt = createdAt
        this.updatedAt = updatedAt
        this.contentId = contentId
        this.representative = representative
        this.selection = selection
        this.isLocked = isLocked
    }
}
