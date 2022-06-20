import { JsonController, Get, CurrentUser, Param, QueryParam, Req } from 'routing-controllers'
import {
    GetPageListDTO,
    makeResponseMessage,
    User
} from '@newturn-develop/types-molink'
import { CustomHttpError } from '../Errors/HttpError'
import { BlogService } from '../Services/BlogService'
import { BlogNotExists, UnauthorizedForBlog } from '../Errors/BlogError'
import AuthorityService from '../Services/AuthorityService'
import { TooManyUserRequestError } from '../Errors/UserError'
import { Request } from 'express'
import { ViewerAPI } from '../API/ViewerAPI'
import PageListService from '../Services/PageListService'

@JsonController('/blog')
export class BlogController {
    @Get('/:id/authority')
    async getBlogAuthority (@CurrentUser() user: User, @Param('id') blogIDString: string) {
        try {
            const dto = await AuthorityService.getBlogAuthority(user, Number(blogIDString))
            return makeResponseMessage(200, dto)
        } catch (err) {
            if (err instanceof BlogNotExists) {
                throw new CustomHttpError(404, 1, '블로그가 존재하지 않습니다.')
            } else {
                throw err
            }
        }
    }

    @Get('/:id')
    async getBlog (@CurrentUser() user: User, @Param('id') blogIDString: string, @Req() req: Request) {
        try {
            const service = new BlogService(new ViewerAPI(req))
            const data = await service.getBlog(user, Number(blogIDString))
            return makeResponseMessage(200, data)
        } catch (err) {
            if (err instanceof BlogNotExists) {
                throw new CustomHttpError(404, 1, '블로그가 존재하지 않습니다.')
            } else {
                throw err
            }
        }
    }

    @Get('/:id/name')
    async getBlogName (@CurrentUser() user: User, @Param('id') blogIDString: string, @Req() req: Request) {
        try {
            const service = new BlogService(new ViewerAPI(req))
            const dto = await service.getBlogName(Number(blogIDString))
            return makeResponseMessage(200, dto)
        } catch (err) {
            if (err instanceof BlogNotExists) {
                throw new CustomHttpError(404, 1, '블로그가 존재하지 않습니다.')
            } else {
                throw err
            }
        }
    }

    @Get('/info-map-by-id')
    async getBlogInfoMapByIDList (@CurrentUser() user: User, @QueryParam('blogIDList') blogIDList: string, @Req() req: Request) {
        try {
            const service = new BlogService(new ViewerAPI(req))
            const dto = await service.getBlogInfoMapByIDList(user, blogIDList.split(',').map(Number))
            return makeResponseMessage(200, dto)
        } catch (err) {
            if (err instanceof TooManyUserRequestError) {
                throw new CustomHttpError(409, 0, '요청이 너무 많습니다.')
            } else {
                throw err
            }
        }
    }

    @Get('/info-map-by-name')
    async getBlogInfoMapByNameList (@CurrentUser() user: User, @QueryParam('blogNameList') blogNameList: string, @Req() req: Request) {
        try {
            const service = new BlogService(new ViewerAPI(req))
            const dto = await service.getBlogInfoMapByNameList(user, blogNameList.split(','))
            return makeResponseMessage(200, dto)
        } catch (err) {
            if (err instanceof TooManyUserRequestError) {
                throw new CustomHttpError(409, 0, '요청이 너무 많습니다.')
            } else {
                throw err
            }
        }
    }

    @Get('/:id/follower-count')
    async getBlogFollowerCount (@CurrentUser() user: User, @Param('id') blogIDString: string, @Req() req: Request) {
        try {
            const service = new BlogService(new ViewerAPI(req))
            const dto = await service.getBlogFollowerCount(Number(blogIDString))
            return makeResponseMessage(200, dto)
        } catch (err) {
            if (err instanceof UnauthorizedForBlog) {
                throw new CustomHttpError(403, 1, '권한이 없습니다.')
            } else {
                throw err
            }
        }
    }

    @Get('/:id/page-list')
    async getBlogPageList (@CurrentUser() user: User, @Param('id') blogIDString: string, @QueryParam('from') from: string, @QueryParam('count') count: string) {
        try {
            const dto = await PageListService.getBlogPageList(user, Number(blogIDString), new GetPageListDTO(Number(from), Number(count)))
            return makeResponseMessage(200, dto)
        } catch (err) {
            if (err instanceof TooManyUserRequestError) {
                throw new CustomHttpError(409, 0, '요청이 너무 많습니다.')
            } else {
                throw err
            }
        }
    }
}

export default BlogController
