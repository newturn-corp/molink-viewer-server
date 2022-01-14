import aws from 'aws-sdk'
import moment from 'moment-timezone'

const dynamoDB = new aws.DynamoDB({ apiVersion: '2012-08-10' })
const dynamoDocumentClient = new aws.DynamoDB.DocumentClient()

class Dynamo {
    _formattingItem (rawItem: any) {
        for (const key in rawItem) {
            if (typeof rawItem[key] === 'number') {
                rawItem[key] = { N: rawItem[key].toString() }
            } else if (typeof rawItem[key] === 'string') {
                rawItem[key] = { S: rawItem[key] }
            } else if (rawItem[key] === null) {
                delete rawItem[key]
            } else if (rawItem[key] instanceof Date) {
                rawItem[key] = { S: moment(rawItem[key]).format('YYYY/MM/DD HH:mm:ss') }
            } else {
                throw new Error('매칭되는 타입이 없습니다.')
            }
        }
        return rawItem
    }

    async batchWriteItem (tableName: string, items: any) {
        const maxAvailItemCountPerInsert = 25
        const loopCount = Math.ceil(items.length / maxAvailItemCountPerInsert)
        const itemLists = new Array(loopCount).fill(1).map(_ => [])
        for (let i = 0; i < loopCount; i++) {
            const start = i * maxAvailItemCountPerInsert
            const end = (i + 1) * maxAvailItemCountPerInsert
            itemLists[i] = items.slice(start, end)
        }
        for (const itemList of itemLists) {
            const param: { RequestItems: any } = {
                RequestItems: { }
            }
            param.RequestItems[tableName] = itemList.map(item => {
                return {
                    PutRequest: {
                        Item: this._formattingItem(item)
                    }
                }
            })
            await new Promise<void>((resolve, reject) => {
                dynamoDB.batchWriteItem(param, (err) => {
                    if (err) {
                        reject(err)
                    }
                    resolve()
                })
            })
        }
    }

    putItem (tableName: string, item: any) {
        const param = {
            TableName: tableName,
            Item: this._formattingItem(item)
        }
        return new Promise<void>((resolve, reject) => {
            dynamoDB.putItem(param, (err) => {
                if (err) {
                    reject(err)
                }
                resolve()
            })
        })
    }

    async query (tableName: string, conditionString: string, args: any, columns: any, limit: number | undefined, ascending: boolean) {
        const params = {
            TableName: tableName,
            KeyConditionExpression: conditionString,
            ExpressionAttributeValues: args,
            Limit: limit,
            ProjectionExpression: columns,
            ScanIndexForward: ascending
        }
        const result = await dynamoDocumentClient.query(params).promise()
        return result.Items
    }
}

export default new Dynamo()
