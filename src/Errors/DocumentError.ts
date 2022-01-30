import { CustomError } from './Common'

export class DocumentNotExist extends CustomError {}

export class HierarchyUserNotExists extends CustomError {}

export class HierarchyNotExists extends CustomError {}

export class DocumentHierarchyInfoNotMatching extends CustomError {}
