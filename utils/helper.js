import fetch from 'node-fetch';
import bluebird from 'bluebird';
import Config from 'config';
import Log4js from 'log4js';
import crypto from 'crypto';

const logger = Log4js.getLogger('logic');

class Helper {
    /**
     * 随机字符串
     * @param length 生成随机串长度
     * @returns {string}
     */
    randomWord = (length = 6) => {
        return Math.random().toString(36).substr(length);
    };

    /**
     * 随机数字
     * @param length 生成随机串长度
     * @returns {string}
     */
    random = (length = 6) => {
        return ((new Array(length + 1)).join('0') + Math.floor(Math.random() * Math.pow(10, length))).substr(-length);
    };

    /**
     * md5加密
     * @param text 待加密原文
     * @returns {string}
     */
    md5 = (text) => {
        return crypto.createHash('md5').update(text).digest('hex');
    };

    /**
     * 时间戳
     * @returns {number}
     */
    unixTime = () => {
        return new Date().getTime();
    };

    /**
     * 是否是手机号
     * @param phone 手机号
     * @returns {boolean}
     */
    isPhone = (phone) => {
        const regExp = new RegExp(/^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
        return regExp.test(phone);
    };

    /**
     * 获取凭证
     * @param unique 唯一串
     * @param device 设备
     * @param addr ip地址
     */
    genAuth = (unique, device, addr) => {
        const jwtAuth = Config.get('JwtAuth').replace(/\/+$/, '');
        return fetch(jwtAuth + '/coder/encode', {
            headers: {
                'content-type': 'application/json'
            },
            method : 'POST',
            body   : JSON.stringify({unique, device, addr}),
        }).then(response => {
            return response.json();
        }).then(auth => {
            return auth.code === 200 ? auth.data : bluebird.reject(auth.message);
        }).catch(err => {
            logger.error(`gen auth token with err -> ${err}`);
            return bluebird.reject(err);
        });
    };

    /**
     * 使用凭证
     * @param jwt json-web-token
     */
    useAuth = (jwt) => {
        const jwtAuth = Config.get('JwtAuth').replace(/\/+$/, '');
        return fetch(jwtAuth + '/coder/decode', {
            headers: {
                'content-type': 'application/json'
            },
            method : 'POST',
            body   : JSON.stringify({jwt}),
        }).then(response => {
            return response.json();
        }).then(auth => {
            return auth.code === 200 ? auth.data : bluebird.reject(auth.message);
        }).catch(err => {
            logger.error(`decode auth token with err -> ${err}`);
            return bluebird.reject(err);
        });
    };

    /**
     * 加密字符串
     * @param original 原文
     * @param slat 盐值
     * @returns {Buffer | string}
     */
    encrypt = (original, slat = '') => {
        original = crypto.createHash('md5').update(original).digest('hex').split("").reverse().join("");
        slat = !slat ? '' : crypto.createHash('md5').update(slat).digest('hex');
        const median = original.substr(0, 16) + slat + original.substr(-16);
        return crypto.createHash('md5').update(median).digest('hex');
    };

    /**
     * 检验密码强度
     * @param original 原文
     * @returns {number}
     */
    checkStrength = (original) => {
        let strength = 0;
        [
            new RegExp(/[0-9]/),
            new RegExp(/[a-z]/),
            new RegExp(/[A-Z]/),
        ].forEach(regExp => {
            regExp.test(original) && strength++;
        });
        original.length < 8 && (strength = 0);
        return strength;
    };
}

export default new Helper();