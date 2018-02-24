import Log4js from 'log4js';
import bluebird from 'bluebird';

import Client from './client';

const logger = Log4js.getLogger('logic');

const Statics = {

    send(type, phone, param) {
        logger.info(`send sms to ${phone} -> ${JSON.stringify(param)}`);
        return Client.send(type, phone, param).then(res => {
            let {Code, Message, BizId, Channel} = res;
            (new this({
                payload: param,
                phone  : phone,
                error  : {
                    code   : Code,
                    message: Message
                },
                bizId  : BizId,
                channel: Channel,
                smsType: type
            })).save();
            return res;
        }).catch(err => {
            err = JSON.parse(err);
            (new this({
                payload: param,
                phone  : phone,
                error  : {
                    code   : err.data.Code,
                    message: err.data.Message
                },
                channel: err.Channel,
                smsType: type,
            })).save();
            logger.error(`send sms to ${phone} with err -> ${JSON.stringify(err)}`);
            return bluebird.reject(err.data);
        });
    }
};

export default Statics;