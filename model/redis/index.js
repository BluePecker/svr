/**
 * Created by shuc on 17/8/7.
 */
import Config from 'config';
import Redis from 'ioredis';
import Log4js from 'log4js';
import Md5 from 'md5';
import Builder from 'parse-dburi';

const logger = Log4js.getLogger('koa');
const options = Config.get('Database.redis') || {};
const auth = Builder.stringify(options);

// retry strategy
const redis = new Redis(auth, options.options || {}, {
    retryStrategy: (times) => {
        if (times < ((options.options || {}).retries || 3)) {
            // 500 ms
            return 500;
        }
    }
});

redis.on('connect', () => {
    logger.info(`REDIS: Successfully connected to ${auth}`);
});

redis.on('error', (err) => {
    logger.info(`REDIS: Unable to connected for err -> ${err}`);
});

class Cache {
    key(key) {
        return Md5(`${this.constructor.name}#${key}`);
    }
}

export {redis, Cache};