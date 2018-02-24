/**
 * Created by shuc on 17/8/30.
 */
import mongoose from 'mongoose';
import bluebird from 'bluebird';

const Statics = {
    // 批量写入数据
    addBatch(arr, user) {
        return this.insertMany(arr.map(item => {
            item.creator = user;
            return item;
        })).then(docs => {
            return docs;
        }).catch(err => {
            return bluebird.reject(err);
        });
    },

    // 获取存储路径
    getAddrByIds(id) {
        const schema = this;
        return schema.find({
            deleted: null,
            _id    : {
                $in: (Array.isArray(id) ? id : [id]).map(item => {
                    return mongoose.Types.ObjectId(item);
                })
            }
        }).then(docs => {
            docs.__proto__.toObject = () => {
                let container = {};
                docs.forEach(item => {
                    container[item._id] = item;
                });
                return container;
            };
            return docs;
        }).catch(err => {
            return bluebird.reject(err);
        });
    }
};

export default Statics;