export interface DocumentSelection {
    path: number[],
    offset: number
}

export default class DocumentEditionInfo {
    id: string
    userId: string
    selection: DocumentSelection | null
    isLocked: boolean

    constructor (id: string, userId: string, selection: DocumentSelection | null, isLocked: boolean) {
        this.id = id
        this.userId = userId
        this.selection = selection
        this.isLocked = isLocked
    }
}
