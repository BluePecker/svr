import bluebird from 'bluebird';
import Log4js from 'log4js';
import SMSClient from '@alicloud/sms-sdk';

const logger = Log4js.getLogger('koa');

export default class {

    // [Mark: 请注意]必须绑定模板编号
    TemplateCode = {
        'sign_up': 'SMS_000000'
    };

    constructor(access, secret) {
        try {
            this.Client = new SMSClient({
                accessKeyId    : access,
                secretAccessKey: secret
            });
        } catch (err) {
            logger.error(`ali sms sdk init err -> ${err}`);
        }
    }

    //noinspection JSUnusedGlobalSymbols
    send = (type, phone, param) => {
        return this.Client.sendSMS({
            PhoneNumbers : phone,
            SignName     : '云通信产品',
            TemplateCode : this.TemplateCode[type],
            TemplateParam: typeof param !== 'string' ? JSON.stringify(param) : param
        }).then(res => {
            let {Code, Message, BizId} = res;
            return {Code, Message, BizId};
        }).catch(err => {
            return bluebird.reject(err.data);
        });
    }
}