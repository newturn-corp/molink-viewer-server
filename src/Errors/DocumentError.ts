import { CustomError } from './Common'

export class DocumentActionForbidden extends CustomError {}

export class UnauthorizedForDocument extends CustomError {}

export class DocumentIsPrivate extends CustomError {}

export class DocumentOnlyOpenedForFollower extends CustomError {}

export class DocumentNotExist extends CustomError {}

export class InvalidAuthorityOfDocumentAction extends CustomError {}

export class HierarchyUserNotExists extends CustomError {}

export class DocumentHierarchyInfoNotMatching extends CustomError {}
