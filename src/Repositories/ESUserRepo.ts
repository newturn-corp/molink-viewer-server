import { OpenSearch } from '@newturn-develop/molink-utils'
import { ESUser } from '@newturn-develop/types-molink'

class ESUserRepo {
    rawSourceToUser (id: string, source: any) {
        return new ESUser(id, source.biography, source.nickname, source.profileImageUrl)
    }

    async searchUsers (nickname: string, from = 0): Promise<ESUser[]> {
        const rawDocuments = await OpenSearch.select('molink-user', {
            query: {
                bool: {
                    must: [{
                        match: {
                            nickname: {
                                query: nickname,
                                fuzziness: 'AUTO'
                            }
                        }
                    }]
                }
            }
        })
        return rawDocuments.map((raw: any) => {
            const { _id: id, _source: source } = raw
            return this.rawSourceToUser(id, source)
        }) as ESUser[]
    }

    async getUserInfoListByIdList (idList: number[]) {
        const rawDocuments = await OpenSearch.select('molink-user', {
            query: {
                ids: {
                    values: idList.map(id => id.toString())
                }
            }
        })
        return rawDocuments.map((raw: any) => {
            const { _id: id, _source: source } = raw
            return this.rawSourceToUser(id, source)
        }) as ESUser[]
    }

    async getUserInfoListByNicknameList (nicknameList: string[]) {
        const rawDocuments = await OpenSearch.select('molink-user', {
            query: {
                terms: {
                    nickname: nicknameList
                }
            }
        })
        return rawDocuments.map((raw: any) => {
            const { _id: id, _source: source } = raw
            return this.rawSourceToUser(id, source)
        }) as ESUser[]
    }
}
export default new ESUserRepo()
