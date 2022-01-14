export default class DocumentHierarchyInfo {
    id: string
    userId: number
    order: number
    isChildrenOpen: boolean
    parentId: string | null

    constructor (id: string, userId: number, order: number, isChildrenOpen: boolean, parentId: string | null) {
        this.id = id
        this.userId = userId
        this.order = order
        this.isChildrenOpen = isChildrenOpen
        this.parentId = parentId
    }
}
