export default class DocumentChildrenOpen {
    documentId: string
    userId: number
    viewerId: number
    open: boolean

    constructor (documentId: string, userId: number, viewerId: number, open: boolean) {
        this.documentId = documentId
        this.userId = userId
        this.viewerId = viewerId
        this.open = open
    }
}
