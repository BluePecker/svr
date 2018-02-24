import bluebird from 'bluebird';
import {redis, Cache} from '../index';
import UserModel from '../../mongo/user';
import Helper from '../../../utils/helper';

class UserRedis extends Cache {
    role(id) {
        const key = this.key(`role#${id}`);
        return redis.get(key).then(cache => {
            return cache || null;
        }).then(cache => {
            if (cache) {
                return parseInt(cache);
            }
            return UserModel.findById(id, 'role').then(user => {
                if (!user) {
                    return bluebird.reject('user not exist');
                }
                return user.role;
            }).then(role => {
                redis.set(key, role, 'EX', 30 * 60);
                return role;
            });
        }).catch(err => bluebird.reject(err));
    }

    lock(account) {
        const key = this.key(`lock#${account}`);
        /**
         * @typedef {{hincrby:function,hset:function,hget:function,hgetall:function}} redis
         */
        return redis.hincrby(key, 'times', 1).then(times => {
            return {
                times,
                second: (times >= 5 ? 2 ** (times - 5) * 60 : 0) + parseInt(Helper.unixTime() / 1000)
            };
        }).then(lock => {
            return redis.hset(key, 'expired', lock.second).then(() => lock);
        }).then(lock => {
            const time = parseInt(Helper.unixTime() / 1000);
            const date = new Date(Helper.unixTime() + 24 * 60 * 60 * 1000);
            const format = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 00:00:00`;
            const dead = Date.parse(format) / 1000 - time;
            // 3分钟内密码输错5次
            let expired = lock.second > time ? lock.second - time : 3 * 60;
            expired = expired > dead ? dead : expired;
            return redis.expire(key, expired).then(() => ({
                times : lock.times,
                second: lock.second > time ? expired : 0
            }));
        }).catch(err => bluebird.reject(err));
    }

    unlock(account) {
        const key = this.key(`lock#${account}`);
        return redis.del(key).then(res => res).catch(err => bluebird.reject(err));
    }

    readLock(account) {
        const key = this.key(`lock#${account}`);
        return redis.hgetall(key).then(lock => {
            /**
             * @typedef {{expired:number}} lock
             */
            const second = lock.expired - parseInt(Helper.unixTime() / 1000);
            return {
                times : parseInt(lock.times),
                second: second > 0 ? second : 0
            };
        }).catch(err => bluebird.reject(err));
    }
}

export default new UserRedis();