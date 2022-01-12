import { MessageAttachment, WebClient } from '@slack/web-api'
import env from '../env'

class Slack {
    private client: WebClient

    constructor () {
        this.client = new WebClient(env.slack.token)
    }

    async sendTextMessage (msg: string, conversationId = 'CH9EXD1QW') {
        try {
            this.client.chat.postMessage({ channel: conversationId, text: msg })
        } catch (err) {
            console.log('slack post error')
            console.log(conversationId)
            console.log(err)
        }
    }

    async sendAttachments (attachments: MessageAttachment[], conversationId = 'CH9EXD1QW') {
        try {
            this.client.chat.postMessage({ channel: conversationId, attachments })
        } catch (err) {
            console.log('slack post error')
            console.log(conversationId)
            console.log(err)
        }
    }
}
export default new Slack()
