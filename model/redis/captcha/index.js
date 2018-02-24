import bluebird from 'bluebird';

import {redis, Cache} from '../index';
import Helper from '../../../utils/helper';

class CaptchaRedis extends Cache {
    save = (code) => {
        const key = this.key(`captcha#${Helper.md5(Helper.unixTime() + Helper.randomWord())}`);
        return redis.set(key, code, 'EX', 3 * 60).then(() => {
            return key;
        }).catch(err => {
            return bluebird.reject(err);
        });
    };

    check = (unique, code) => {
        return redis.get(unique).then(captcha => {
            return redis.del(unique).then(() => {
                return code === captcha;
            });
        }).catch(err => {
            return bluebird.reject(err);
        });
    };
}

export default new CaptchaRedis();