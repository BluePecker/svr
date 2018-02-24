/**
 * Created by shuc on 17/8/18.
 */
import Service from '../index';
import ObjectModel from '../../model/mongo/object';
import ObjectRedis from '../../model/redis/object';

class ObjectService extends Service {

    //noinspection JSUnusedGlobalSymbols
    /**
     * 对象存储
     * @param ctx
     * @returns {*|Promise|Promise.<array>}
     */
    save(ctx) {
        const params = ctx.request.body;
        return ObjectModel.addBatch(params, ctx.user).then(objects => {
            this.success(objects.map(item => {
                return {
                    _id    : item._id,
                    address: item.address || {
                        route   : '',
                        location: ''
                    }
                };
            }));
        }).catch(err => {
            this.failure(err.message);
        });
    }

    /**
     * 浏览存储对象
     * @param ctx
     * @returns {Promise.<>|Promise}
     */
    scan(ctx) {
        return ObjectRedis.getById(ctx.params._id).then(object => {
            if (!object) {
                throw new Error('object not exists.');
            }
            ctx.redirect(object.address.route);
        }).catch(() => {
            ctx.throw(404);
        });
    }
}

//noinspection JSUnusedGlobalSymbols
export default new ObjectService();