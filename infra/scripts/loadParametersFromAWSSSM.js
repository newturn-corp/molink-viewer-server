#!/usr/bin/node
const fs = require('fs')
// eslint-disable-next-line import/no-absolute-path
const AWS = require('/home/ubuntu/knowlink-viewer/node_modules/aws-sdk')
AWS.config.update({ region: 'ap-northeast-2' })
const ssm = new AWS.SSM()

async function loadEnvParameters (envParams, token) {
    const params = {
        Path: `/knowlink-viewer/${process.env.DEPLOYMENT_GROUP_NAME}/`,
        Recursive: true,
        WithDecryption: true,
        NextToken: token
    }
    const res = await ssm.getParametersByPath(params).promise()
    for (const p of res.Parameters) {
        const key = p.Name.split('/').slice(-1)[0]
        const value = p.Value
        envParams.push(`${key.toUpperCase()}=${value}`)
    }
    if (res.NextToken) {
        return loadEnvParameters(envParams, res.NextToken)
    } else {
        return envParams
    }
}

async function createDotEnv () {
    const envParams = await loadEnvParameters([], null)
    const envString = envParams.sort().join('\n')
    fs.writeFileSync('/home/ubuntu/knowlink-viewer/.env', envString)
}

createDotEnv()
