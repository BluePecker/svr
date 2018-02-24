import mongoose from '../index';
import statics from './static';
import Role from './../../../const/role';

const Schema = new mongoose.Schema({
    // 昵称
    nickname: {
        type   : String,
        default: ''
    },
    // 头像
    avatar  : {
        type: mongoose.Schema.Types.ObjectId,
    },
    // IP地址
    ip      : {
        type   : String,
        default: '0.0.0.0'
    },
    // 手机号
    phone   : {
        type   : String,
        default: ''
    },
    // 用户角色(详细请查看Role定义)
    role    : {
        type   : Number,
        default: Role.USER
    }
}, {
    versionKey: false,
    timestamps: {createdAt: 'created', updatedAt: 'modified'}
});

Schema.statics = statics;

export default mongoose.model('user', Schema);