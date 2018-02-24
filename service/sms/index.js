import Service from '../index';

import Helper from '../../utils/helper';
import PhoneRedis from '../../model/redis/phone';
import Sms from '../../model/mongo/sms';

class SmsService extends Service {

    //noinspection JSUnusedGlobalSymbols
    /**
     * 发送验证短信
     * @param ctx
     * @returns {*}
     */
    send(ctx) {
        const {phone, type} = ctx.request.body;
        if (!Helper.isPhone(phone)) {
            return this.failure({
                ttl: 0
            }, 'error phone number');
        } else if (!type) {
            return this.failure({
                ttl: 0
            }, 'please assign sms template');
        }
        const code = Helper.random();
        return PhoneRedis.genForSms(phone, code).then(cache => {
            if (!cache.status) {
                return this.failure({
                    ttl: cache.ttl
                }, 'please wait for moment');
            }
            // 异步发送短信验码
            Promise.resolve().then(() => {
                return Sms.send(type, phone, {code});
            }).catch(() => {
            });
            return this.success({ttl: cache.ttl});
        }).catch(err => {
            return this.failure({ttl: 0}, err);
        });
    }

    /**
     * 查看验证码(just for test)
     * @param ctx
     */
    scan(ctx) {
        return PhoneRedis.getSmsCode(ctx.params.phone).then(code => {
            return this.success({code});
        }).catch(err => {
            return this.failure(err);
        });
    }
}

//noinspection JSUnusedGlobalSymbols
export default new SmsService();