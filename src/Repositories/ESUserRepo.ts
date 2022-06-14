import { OpenSearch } from '@newturn-develop/molink-utils'
import { ESUser } from '@newturn-develop/types-molink'

class ESUserRepo {
    rawSourceToUser (id: string, source: any) {
        return new ESUser(id, source.biography, source.nickname, source.profileImageUrl)
    }

    async searchUsers (nickname: string, from: number, size: number) {
        const {
            total,
            documents: rawDocuments
        } = await OpenSearch.selectWithTotal('molink-user', {
            query: {
                match: {
                    nickname: {
                        query: nickname,
                        fuzziness: 'AUTO'
                    }
                }
            },
            from,
            size
        })
        return {
            total,
            documents: rawDocuments.map((raw: any) => {
                const { _id: id, _source: source } = raw
                return this.rawSourceToUser(id, source)
            }) as ESUser[]
        }
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
                    'nickname.keyword': nicknameList
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
