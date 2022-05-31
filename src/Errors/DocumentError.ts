import { CustomError } from './Common'

export class PageNotExist extends CustomError {}

export class HierarchyUserNotExists extends CustomError {}

export class HierarchyNotExists extends CustomError {}

export class DocumentHierarchyInfoNotMatching extends CustomError {}

export class DocumentUserNotExists extends CustomError {}
