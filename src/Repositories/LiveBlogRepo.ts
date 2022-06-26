import { Knex } from 'knex'
import { getKnexClient } from '@newturn-develop/molink-utils'
import env from '../env'
import * as Y from 'yjs'
import CacheService from '../Services/CacheService'
import { HierarchyDocumentInfoInterface } from '@newturn-develop/types-molink'
import { HierarchyNotExists } from '../Errors/DocumentError'

interface BlogUpdate {
    id: string;
    blogID: number;
    update: Uint8Array;
}

class LiveBlogRepo {
    client: Knex<BlogUpdate>

    constructor () {
        this.client = getKnexClient('pg', env.postgre.hierarchy.host, env.postgre.hierarchy.user, env.postgre.hierarchy.password, env.postgre.hierarchy.name)
    }

    async getBlog (blogID: number) {
        const updates = await this.client.transaction(async (transaction) => {
            const updates = await this.client<BlogUpdate>('blog').transacting(transaction).where('blogID', blogID).forUpdate().orderBy('id')

            if (updates.length >= 50) {
                const dbYDoc = new Y.Doc()

                dbYDoc.transact(() => {
                    for (const { update } of updates) {
                        Y.applyUpdate(dbYDoc, update)
                    }
                })

                const [mergedUpdates] = await Promise.all([
                    this.client<BlogUpdate>('blog')
                        .transacting(transaction)
                        .insert({ blogID, update: Y.encodeStateAsUpdate(dbYDoc) })
                        .returning('*'),
                    this.client<BlogUpdate>('blog')
                        .transacting(transaction).where('blogID', blogID)
                        .whereIn('id', updates.map(({ id }) => id))
                        .delete()
                ])

                return mergedUpdates
            } else {
                return updates
            }
        })
        if (updates.length === 0) {
            return undefined
        }
        const document = new Y.Doc()
        document.transact(() => {
            for (const { update } of updates) {
                Y.applyUpdate(document, update)
            }
        })
        return document
    }

    async getBlogPageInfo (blogID: number, pageId: string) {
        const pageStrInRedis = await CacheService.hierarchy.get(`page-${pageId}`)
        if (pageStrInRedis) {
            return JSON.parse(pageStrInRedis) as HierarchyDocumentInfoInterface
        }
        const blog = await this.getBlog(blogID)
        if (!blog) {
            throw new HierarchyNotExists()
        }
        const hierarchyPageInfo = blog.getMap('pageInfoMap').get(pageId) as HierarchyDocumentInfoInterface
        await CacheService.hierarchy.setWithEx(`page-${pageId}`, JSON.stringify(hierarchyPageInfo), 86400)
        return hierarchyPageInfo
    }
}

export default new LiveBlogRepo()
