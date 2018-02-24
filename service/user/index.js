/**
 * Created by shuc on 17/8/6.
 */
import Service from '../index';
import Helper from '../../utils/helper';
import PhoneRedis from '../../model/redis/phone';
import UserModel from '../../model/mongo/user';

class UserService extends Service {
    /**
     * 通过手机号注册
     * @param ctx
     * @returns {*}
     */
    signUpByPhone(ctx) {
        const {phone, code, device, password, role} = ctx.request.body;
        if (!Helper.isPhone(phone)) {
            return this.failure('error phone number');
        }
        if (Helper.checkStrength(password) < 3) {
            return this.failure('weak password');
        }
        return PhoneRedis.checkSmsCode(phone, code).then(bool => {
            if (!bool) {
                return this.failure('sms code error');
            }
            return UserModel.signUpByPhone(phone, password, ctx.request.ip, role);
        }).then(_id => {
            return Helper.genAuth(_id, device, ctx.request.ip).then(data => {
                return this.success(data);
            });
        }).catch(err => {
            return this.failure(err);
        });
    }

    /**
     * 通过手机号登录
     * @param ctx
     * @returns {*}
     */
    signInByPhone(ctx) {
        const {phone, password, device} = ctx.request.body;
        if (!Helper.isPhone(phone)) {
            return this.failure('error phone number');
        }
        return UserModel.signInByPhone(phone, password).then(_id => {
            return Helper.genAuth(_id, device, ctx.request.ip).then(data => {
                return this.success(data);
            });
        }).catch(err => {
            if (err.lock) {
                return this.failure(err.lock, err.message);
            }
            return this.failure(err.message || err);
        });
    }

    /**
     * 获取用户信息
     * @param ctx
     * @returns {Promise}
     */
    information(ctx) {
        const {_id} = ctx.user;
        return UserModel.getBaseInfo(_id).then(user => {
            return this.success(user);
        }).catch(err => {
            return this.failure(err);
        });
    }

    /**
     * 重置手机号
     * @param ctx
     * @returns {*}
     */
    resetPhone(ctx) {
        const {phone, code, password, device} = ctx.request.body;
        if (!Helper.isPhone(phone)) {
            return this.failure('error phone number');
        }
        if (Helper.checkStrength(password) < 3) {
            return this.failure('weak password');
        }
        return PhoneRedis.checkSmsCode(phone, code).then(bool => {
            if (!bool) {
                return this.failure('sms code error');
            }
            return UserModel.resetPhone({_id: ctx.user._id}, phone, password);
        }).then(_id => {
            return Helper.genAuth(_id, device, ctx.request.ip).then(data => {
                return this.success(data);
            });
        }).catch(err => {
            if (err.lock) {
                return this.failure(err.lock, err.message);
            }
            return this.failure(err.message || err);
        });
    }

    /**
     * 重置密码
     * @param ctx
     * @returns {Promise}
     */
    resetPassword(ctx) {
        const {oldPwd, newPwd, device} = ctx.request.body;
        return UserModel.resetPassword({
            _id: ctx.user._id
        }, oldPwd, newPwd).then(_id => {
            return Helper.genAuth(_id, device, ctx.request.ip).then(data => {
                return this.success(data);
            });
        }).catch(err => {
            if (err.lock) {
                return this.failure(err.lock, err.message);
            }
            return this.failure(err.message || err);
        });
    }
}

//noinspection JSUnusedGlobalSymbols
export default new UserService();