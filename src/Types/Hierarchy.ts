export interface DocumentHierarchyBlock {
    id: string,
    children: DocumentHierarchyBlock[]
}

export interface Hierarchy {
    map: {
        [index: string]: {
            id: string,
            title: string
            icon: string
            userId: number,
            location: string,
            parentId: string,
            order: number
        }
    },
    list: DocumentHierarchyBlock[]
    lastUsedAt: Date
}
