import { JsonController, Get, CurrentUser, Param, Req, Authorized } from 'routing-controllers'
import {
    makeResponseMessage,
    User
} from '@newturn-develop/types-molink'
import { CustomHttpError } from '../Errors/HttpError'
import { PageService } from '../Services/PageService'
import { PageNotExists, UnauthorizedForPage } from '../Errors/PageError'
import { CommentService } from '../Services/CommentService'
import { ViewerAPI } from '../API/ViewerAPI'
import { Request } from 'express'

@JsonController('/pages')
export class PageController {
    @Get('/:id/summary')
    async getPageSummary (@CurrentUser() user: User, @Param('id') id: string, @Req() req: Request) {
        try {
            const service = new PageService(new ViewerAPI(req))
            const dto = await service.getPageSummary(user, id)
            return makeResponseMessage(200, dto)
        } catch (err) {
            if (err instanceof PageNotExists) {
                throw new CustomHttpError(404, 1, '페이지가 존재하지 않습니다.')
            } else if (err instanceof UnauthorizedForPage) {
                throw new CustomHttpError(403, 1, '권한이 없습니다.')
            } else {
                throw err
            }
        }
    }

    @Get('/:id/meta-info')
    async getPageMetaInfo (@CurrentUser() user: User, @Param('id') id: string, @Req() req: Request) {
        try {
            const service = new PageService(new ViewerAPI(req))
            const dto = await service.getPageMetaInfo(user, id)
            return makeResponseMessage(200, dto)
        } catch (err) {
            if (err instanceof PageNotExists) {
                throw new CustomHttpError(404, 1, '페이지가 존재하지 않습니다.')
            } else if (err instanceof UnauthorizedForPage) {
                throw new CustomHttpError(403, 1, '권한이 없습니다.')
            } else {
                throw err
            }
        }
    }

    @Get('/:id/editor-page-info')
    async getEditorPageInfo (@CurrentUser() user: User, @Param('id') id: string, @Req() req: Request) {
        try {
            const service = new PageService(new ViewerAPI(req))
            const dto = await service.getEditorPageInfo(user, id)
            return makeResponseMessage(200, dto)
        } catch (err) {
            if (err instanceof PageNotExists) {
                throw new CustomHttpError(404, 1, '페이지가 존재하지 않습니다.')
            } else if (err instanceof UnauthorizedForPage) {
                throw new CustomHttpError(403, 1, '권한이 없습니다.')
            } else {
                throw err
            }
        }
    }

    @Get('/:id/like')
    @Authorized()
    async getUserPageLike (@CurrentUser() user: User, @Param('id') id: string, @Req() req: Request) {
        const service = new PageService(new ViewerAPI(req))
        const dto = await service.getUserLikePage(user, id)
        return makeResponseMessage(200, dto)
    }

    @Get('/:id/comments')
    async getPageComments (@CurrentUser() user: User, @Param('id') id: string, @Req() req: Request) {
        try {
            const service = new CommentService(new ViewerAPI(req))
            const arr = await service.getPageComments(user, id)
            return makeResponseMessage(200, arr)
        } catch (err) {
            if (err instanceof UnauthorizedForPage) {
                throw new CustomHttpError(403, 0, '권한이 없습니다.')
            } else {
                throw err
            }
        }
    }
}

export default PageController
