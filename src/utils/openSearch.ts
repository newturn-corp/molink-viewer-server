import { HttpRequest } from '@aws-sdk/protocol-http'
import { defaultProvider } from '@aws-sdk/credential-provider-node'
import { SignatureV4 } from '@aws-sdk/signature-v4'
import { NodeHttpHandler } from '@aws-sdk/node-http-handler'
import { Sha256 } from '@aws-crypto/sha256-browser'

import env from '../env'

class OpenSearch {
    async request (body: any, method: string, path: string) {
        const request = new HttpRequest({
            body,
            headers: {
                'Content-Type': 'application/json',
                host: env.opensearch.domain
            },
            hostname: env.opensearch.domain,
            method,
            path
        })

        // Sign the request
        const signer = new SignatureV4({
            credentials: defaultProvider(),
            region: env.opensearch.region,
            service: 'es',
            sha256: Sha256
        })

        const signedRequest = await signer.sign(request) as any

        // Send the request
        const client = new NodeHttpHandler()
        const { response } = await client.handle(signedRequest)
        let responseBody = ''
        const result = await new Promise((resolve) => {
            response.body.on('data', (chunk: any) => {
                responseBody += chunk
            })
            response.body.on('end', () => {
                // eslint-disable-next-line no-console
                console.log(JSON.parse(responseBody))
                resolve(JSON.parse(responseBody))
            })
        })
        return result as any
    }

    async insert (index: string, type: string, document: Object) {
        const resBody = await this.request(JSON.stringify(document), 'POST', index + '/' + type)
        return resBody._id
    }

    async insertImmediately (index: string, type: string, document: Object) {
        const resBody = await this.request(JSON.stringify(document), 'POST', index + '/' + type + '?refresh=true')
        return resBody._id
    }

    async update (index: string, id: string, document: any) {
        const source = Object.keys(document).map(key => {
            if (document[key] === null) {
                delete document[key]
                return `ctx._source.${key} = null`
            } else {
                return `ctx._source.${key} = params.${key}`
            }
        }).join('; ')
        const resBody = await this.request(JSON.stringify({
            script: {
                lang: 'painless',
                source,
                params: document
            }
        }), 'POST', index + '/_update/' + id)
        return resBody
    }

    async updateByQuery (index: string, query: Object, document: any) {
        const source = Object.keys(document).map(key => {
            if (document[key] === null) {
                delete document[key]
                return `ctx._source.${key} = null`
            } else {
                return `ctx._source.${key} = params.${key}`
            }
        }).join('; ')
        const resBody = await this.request(JSON.stringify({
            query,
            script: {
                lang: 'painless',
                source,
                params: document
            }
        }), 'POST', index + '/_update_by_query')
        return resBody
    }

    async updateByQueryWithScript (index: string, query: Object, script: string) {
        const resBody = await this.request(JSON.stringify({
            query,
            script: {
                lang: 'painless',
                source: script
            }
        }), 'POST', index + '/_update_by_query')
        return resBody
    }

    async delete (index: string, id: string, type: string) {
        const resBody = await this.request(undefined, 'DELETE', index + '/' + type + '/' + id)
        return resBody
    }

    async deleteByQuery (index: string, query: Object) {
        const resBody = await this.request(JSON.stringify(query), 'POST', index + '/_delete_by_query')
        return resBody
    }

    async select (index: string, query: Object) {
        const resBody = await this.request(`{ "index": "${index}" }\n${JSON.stringify(query)}\n`, 'POST', '_msearch')
        return resBody.responses[0].hits.hits
    }

    async get (index: string, id: string) {
        const resBody = await this.request(undefined, 'GET', index + '/_doc/' + id)
        return resBody._source
    }
}

export default new OpenSearch()
