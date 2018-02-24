import Service from "../index";

import AreaRedis from '../../model/redis/area';

class AreaService extends Service {

    /**
     * 地区树
     * @returns {*}
     */
    tree = () => {
        return AreaRedis.tree().then(tree => {
            return this.success(tree);
        }).catch(err => {
            return this.failure(err);
        });
    }
}

//noinspection JSUnusedGlobalSymbols
export default new AreaService();