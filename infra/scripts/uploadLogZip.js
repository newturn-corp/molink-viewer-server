require('dotenv').config()

const fs = require('fs')
const aws = require('aws-sdk')
const ip = require('ip')
const moment = require('moment-timezone')

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const s3 = new aws.S3()

const body = fs.createReadStream('/home/ubuntu/log.zip')
const param = {
    Bucket: 'knowlink-viewer-instance-log',
    Body: body,
    Key: `log__${moment().format('YYYY-MM-DD_HH:mm:ss')}_${ip.address()}.zip`
}

s3.upload(param).promise()
