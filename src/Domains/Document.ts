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
    visibility: DocumentVisibility
    parentId: string
    order: number
    location: string

    createdAt: Date
    updatedAt: Date

    contentId: string
    editionInfoId: string

    constructor (id: string, userId: number, title: string, icon: string, visibility: DocumentVisibility, parentId: string, order: number, location: string, createdAt: Date, updatedAt: Date, contentId: string, editionInfoId: string) {
        this.id = id
        this.userId = userId
        this.title = title
        this.icon = icon
        this.visibility = visibility
        this.parentId = parentId
        this.order = order
        this.location = location
        this.createdAt = createdAt
        this.updatedAt = updatedAt
        this.contentId = contentId
        this.editionInfoId = editionInfoId
    }
}
