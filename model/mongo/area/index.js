/**
 * Created by shuc on 17/8/18.
 */
import mongoose from '../index';
import statics from './static';

const Schema = new mongoose.Schema({
    // 代码
    code  : String,
    // 名字
    name  : {
        en: {
            require: true,
            type   : String
        },
        cn: {
            require: true,
            type   : String
        },
    },
    // 父级
    father: {
        _id: mongoose.Schema.Types.ObjectId
    },
    // 是否启用
    status: Boolean
}, {
    versionKey: false,
    timestamps: {createdAt: 'created', updatedAt: 'modified'}
});

Schema.statics = statics;

export default mongoose.model('area', Schema);