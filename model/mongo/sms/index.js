import mongoose from '../index';
import statics from './static';

const Schema = new mongoose.Schema({
    // 手机号
    phone  : {
        type   : String,
        require: true
    },
    // 参数
    payload: Object,
    // 错误信息
    error  : {
        // 错误码
        code   : {
            type: String,
        },
        // 错误消息
        message: {
            type: String,
        }
    },
    // 回执编号
    bizId  : {
        type: String,
    },
    // 发送渠道
    channel: {
        type   : String,
        require: true
    },
    // 短信类型
    smsType: {
        type   : String,
        require: true
    }
}, {
    versionKey: false,
    timestamp : {createdAt: 'created', updateAt: 'modified'}
});

Schema.statics = statics;
export default mongoose.model('sms', Schema);