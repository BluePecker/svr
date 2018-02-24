import mongoose from '../index';

const Schema = new mongoose.Schema({
    // 用户相关
    user    : {
        // 用户编号
        _id: {
            type   : mongoose.Schema.Types.ObjectId,
            require: true
        }
    },
    // 认证相关
    identity: {
        // 登录类型: phone-手机号 email-邮箱 username-用户名
        genre     : {
            type   : String,
            require: true
        },
        // 标识（手机号 邮箱 用户名或第三方应用的唯一标识）
        identifier: {
            type   : String,
            require: true
        },
        // 加密盐值
        salt      : {
            type   : String,
            default: ''
        },
        // 密码凭证（站内的保存密码，站外的不保存或保存token）
        credential: {
            type   : String,
            default: ''
        }
    }
}, {
    versionKey: false,
    timestamps: {createdAt: 'created', updatedAt: 'modified'}
});

export default mongoose.model('user_auth', Schema);