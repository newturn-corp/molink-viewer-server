import { Knex } from 'knex'
import { getKnexClient } from '@newturn-develop/molink-utils'
import env from '../env'
import * as Y from 'yjs'
import CacheService from '../Services/CacheService'
import { HierarchyDocumentInfoInterface } from '@newturn-develop/types-molink'
import { HierarchyNotExists } from '../Errors/DocumentError'

interface HierarchyUpdate {
    id: string;
    userId: number;
    update: Uint8Array;
}

class HierarchyRepo {
    client: Knex<HierarchyUpdate>

    constructor () {
        this.client = getKnexClient('pg', env.postgre.hierarchy.host, env.postgre.hierarchy.user, env.postgre.hierarchy.password, env.postgre.hierarchy.name)
    }

    async getHierarchy (userId: number) {
        const updates = await this.client.transaction(async (transaction) => {
            const updates = await this.client<HierarchyUpdate>('items').transacting(transaction).where('userId', userId).forUpdate().orderBy('id')

            if (updates.length >= 50) {
                const dbYDoc = new Y.Doc()

                dbYDoc.transact(() => {
                    for (const { update } of updates) {
                        Y.applyUpdate(dbYDoc, update)
                    }
                })

                const [mergedUpdates] = await Promise.all([
                    this.client<HierarchyUpdate>('items').transacting(transaction).insert({ userId, update: Y.encodeStateAsUpdate(dbYDoc) }).returning('*'),
                    this.client<HierarchyUpdate>('items').transacting(transaction).where('userId', userId).whereIn('id', updates.map(({ id }) => id)).delete()
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

    async getHierarchyPageInfo (userId: number, pageId: string) {
        const pageStrInRedis = await CacheService.hierarchy.get(`page-${pageId}`)
        if (pageStrInRedis) {
            return JSON.parse(pageStrInRedis) as HierarchyDocumentInfoInterface
        }
        const hierarchy = await this.getHierarchy(userId)
        if (!hierarchy) {
            throw new HierarchyNotExists()
        }
        const hierarchyPageInfo = hierarchy.getMap('documentHierarchyInfoMap').get(pageId) as HierarchyDocumentInfoInterface
        await CacheService.hierarchy.setWithEx(`page-${pageId}`, JSON.stringify(hierarchyPageInfo), 1800)
        return hierarchyPageInfo
    }
}

export default new HierarchyRepo()
