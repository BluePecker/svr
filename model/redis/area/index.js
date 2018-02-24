import bluebird from 'bluebird';

import {redis, Cache} from '../index';
import AreaModel from '../../mongo/area';

class AreaRedis extends Cache {
    // 获取地区树形结构
    tree() {
        const key = this.key('tree');
        return redis.get(key).then(cache => {
            return cache ? JSON.parse(cache) : [];
        }).then(cache => {
            return cache.length > 0 ? cache : AreaModel.tree().then(tree => {
                redis.set(key, JSON.stringify(tree), 'EX', 24 * 60 * 60);
                return tree;
            });
        }).catch(err => bluebird.reject(err));
    }

    // 清理地区树形缓存结构
    clear() {
        redis.del(this.key('tree'));
    }
}

export default new AreaRedis();