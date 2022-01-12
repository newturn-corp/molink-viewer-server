export class ContentDto {
    documentId: string
    value: any

    constructor (documentId: string, value: any) {
        this.documentId = documentId
        this.value = value
    }
}

export class CreateContentDto {
    documentId: string
    value: any

    constructor (documentId: string, value: any) {
        this.documentId = documentId
        this.value = value
    }
}

export class UpdateContentDto {
    id: string
    content: any

    constructor (id: string, content: any) {
        this.id = id
        this.content = content
    }
}

export class UploadContentImageResponseDTO {
    url: string

    constructor (url: string) {
        this.url = url
    }
}
