/**
 * @typedef {{ttl:function}} redis
 */
import bluebird from 'bluebird';

import {redis, Cache} from '../index';

class PhoneRedis extends Cache {
    genForSms = (phone, code) => {
        const key = this.key(`sms#${phone}`);
        const expired = 60 * 15;
        const wait = 60;
        return redis.ttl(key).then(ttl => {
            if (expired - ttl <= wait) {
                return {status: false, ttl: wait - (expired - ttl)};
            }
            return redis.set(key, code, 'EX', expired).then(() => {
                return {status: true, ttl: wait};
            }).catch(err => {
                return bluebird.reject(err);
            });
        }).catch(err => {
            return bluebird.reject(err);
        });
    };

    getSmsCode = (phone) => {
        const key = this.key(`sms#${phone}`);
        return redis.get(key).then(code => {
            return code;
        }).catch(err => {
            return bluebird.reject(err);
        });
    };

    checkSmsCode = (phone, code) => {
        const key = this.key(`sms#${phone}`);
        return redis.get(key).then(cache => {
            return redis.del(key).then(() => {
                return cache === code;
            }).catch(err => {
                return bluebird.reject(err);
            });
        }).catch(err => {
            return bluebird.reject(err);
        });
    }
}

export default new PhoneRedis();