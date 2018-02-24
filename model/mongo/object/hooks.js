/**
 * Created by shuc on 17/8/30.
 */
import ObjectRedis from '../../redis/object';

class Hooks {
    constructor(schema) {
        [
            'insertMany',
            'updateMany',
            'update',
            'remove',
            'save',
            'updateOne',
            'findOneAndRemove',
            'findOneAndUpdate'
        ].forEach(item => {
            schema.post(item, (doc) => {
                ObjectRedis.clearById(doc._id);
            });
        });
    }
}

export default Hooks;