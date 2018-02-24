/**
 * Created by shuc on 17/8/18.
 */
import mongoose from '../index';
import Hooks from './hooks';
import statics from './static';

const Schema = new mongoose.Schema({
    // 删除时间
    deleted: {
        type   : Date,
        default: null
    },
    // 创建者
    creator: {
        _id: {
            type    : mongoose.Schema.Types.ObjectId,
            required: true
        }
    },
    // 数据保存地址
    address: {
        // 路径
        route   : {
            type    : String,
            required: true
        },
        // 数据储存位置
        location: {
            type   : String,
            default: 'qiniu'
        }
    }
}, {
    versionKey: false,
    timestamps: {createdAt: 'created', updatedAt: 'modified'}
});

new Hooks(Schema);
Schema.statics = statics;

export default mongoose.model('object', Schema);