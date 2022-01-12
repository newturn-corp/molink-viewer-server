export default class DocumentAuthority {
    viewable: boolean
    editable: boolean

    constructor (viewable: boolean, editable: boolean) {
        this.viewable = viewable
        this.editable = editable
    }
}
