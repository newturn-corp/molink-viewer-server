import nodemailer from 'nodemailer'
import aws from 'aws-sdk'
import env from '../env'

aws.config.update({
    accessKeyId: env.aws.accessKeyId,
    secretAccessKey: env.aws.secretAccessKey,
    region: env.aws.region
})

const transporter = nodemailer.createTransport({
    SES: new aws.SES({
        apiVersion: '2010-12-21'
    })
})

export default async (email: string, subject: string, html: string) => {
    const result = transporter.sendMail({
        from: 'listen@molink.life',
        to: email,
        subject,
        html
    })
    return result
}
