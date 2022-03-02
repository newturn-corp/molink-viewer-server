import { Knex } from 'knex'
import { getKnexClient } from '@newturn-develop/molink-utils'
import env from '../env'
import * as Y from 'yjs'

interface ContentUpdate {
    id: string;
    documentId: string;
    update: Uint8Array;
}

class ContentRepo {
    client: Knex<ContentUpdate>

    constructor () {
        this.client = getKnexClient('pg', env.postgre.content.host, env.postgre.content.user, env.postgre.content.password, env.postgre.content.name)
    }

    async getContent (documentId: string) {
        const updates = await this.client.transaction(async (transaction) => {
            const updates = await this.client<ContentUpdate>('items').transacting(transaction).where('documentId', documentId).forUpdate().orderBy('id')

            if (updates.length >= 50) {
                const dbYDoc = new Y.Doc()

                dbYDoc.transact(() => {
                    for (const { update } of updates) {
                        Y.applyUpdate(dbYDoc, update)
                    }
                })

                const [mergedUpdates] = await Promise.all([
                    this.client<ContentUpdate>('items').transacting(transaction).insert({ documentId, update: Y.encodeStateAsUpdate(dbYDoc) }).returning('*'),
                    this.client<ContentUpdate>('items').transacting(transaction).where('documentId', documentId).whereIn('id', updates.map(({ id }) => id)).delete()
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
}

export default new ContentRepo()
