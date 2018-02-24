import bluebird from 'bluebird';
import Log4js from 'log4js';

import Helper from '../../../utils/helper';
import UserAuthModel from '../userauth';
import UserRedis from '../../redis/user';

const logger = Log4js.getLogger('logic');

const Statics = {
    /**
     * 通过手机号注册
     * @param phone 手机号
     * @param password 密码
     * @param ip 注册时ip地址
     * @param role 用户身份
     * @returns {Promise}
     */
    signUpByPhone(phone, password, ip, role) {
        return UserAuthModel.findOne({
            'identity.identifier': phone,
            'identity.genre'     : 'phone',
        }).then(auth => {
            if (auth !== null) {
                return bluebird.reject('phone number is occupied');
            }
            return (new this({
                nickname: '',
                ip      : ip || '0.0.0.0',
                avatar  : '',
                role    : role,
                phone   : phone,
            })).save().then(user => {
                const salt = password ? Helper.randomWord() : '';
                const credential = password ? Helper.encrypt(password, salt) : password;
                return (new UserAuthModel({
                    user    : {_id: user._id},
                    identity: {
                        identifier: user.phone,
                        genre     : 'phone',
                        salt      : salt,
                        credential: credential,
                    }
                })).save().then(() => {
                    return user._id.toString();
                });
            });
        }).catch(err => bluebird.reject(err));
    },

    /**
     * 通过手机号登录
     * @param phone 手机号
     * @param password 密码
     * @returns {Promise}
     */
    signInByPhone(phone, password) {
        return UserRedis.readLock(phone).then(lock => {
            if (lock.second > 0) {
                return bluebird.reject({
                    lock,
                    message: 'sign in too much'
                });
            }
        }).then(() => {
            return UserAuthModel.findOne({
                'identity.identifier': phone,
                'identity.genre'     : 'phone',
            }, 'user identity');
        }).then(auth => {
            if (auth === null) {
                return bluebird.reject('phone number is not exist');
            }
            const credential = Helper.encrypt(password, auth.identity.salt);
            if (auth.identity.credential !== credential) {
                return UserRedis.lock(phone).then(lock => {
                    return bluebird.reject({
                        lock,
                        message: 'password error',
                    });
                });
            } else {
                Promise.resolve().then(() => {
                    return UserRedis.unlock(phone);
                }).catch(err => logger.info(`unlock account for check password with err -> ${err}`));
                return auth.user._id.toString();
            }
        }).catch(err => bluebird.reject(err));
    },

    /**
     * 重置密码
     * @param {{_id:string}} user 要修改的用户
     * @param oldPwd 旧密码
     * @param newPwd 新密码
     * @returns {Promise}
     */
    resetPassword(user, oldPwd, newPwd) {
        return UserRedis.readLock(lock => {
            if (lock.second > 0) {
                return bluebird.reject({
                    lock,
                    message: 'sign in too much'
                });
            }
        }).then(() => {
            return UserAuthModel.find({user}, 'identity');
        }).then(auth => {
            if (!auth.length) {
                return bluebird.reject('user is not exist');
            }
            // 逐项检查(主要是为了解决多种登录方式的问题)
            auth = auth.filter(item => {
                const {credential, salt} = item.identity;
                return credential === Helper.encrypt(oldPwd, salt);
            });
            if (!auth.length) {
                return UserRedis.lock(user._id).then(lock => {
                    return bluebird.reject({
                        lock,
                        message: 'password error',
                    });
                });
            } else {
                if (Helper.checkStrength(newPwd) < 3) {
                    return bluebird.reject('weak password');
                }
                auth[0].identity.salt = Helper.randomWord();
                auth[0].identity.credential = Helper.encrypt(newPwd, auth[0].identity.salt);
                return auth[0].save().then(auth => {
                    Promise.resolve().then(() => {
                        return UserRedis.unlock(user._id);
                    }).catch(err => logger.info(`unlock account for check password with err -> ${err}`));
                    return auth.user._id.toString();
                });
            }
        }).catch(err => bluebird.reject(err));
    },

    /**
     * 重置手机号
     * @param {{_id:string}} user 要修改的用户
     * @param phone 新手机号
     * @param password 密码
     * @returns {Promise}
     */
    resetPhone(user, phone, password) {
        return UserRedis.readLock(lock => {
            if (lock.second > 0) {
                return bluebird.reject({
                    lock,
                    message: 'sign in too much'
                });
            }
        }).then(() => {
            return UserAuthModel.findOne({
                'identity.identifier': phone,
                'identity.genre'     : 'phone',
                'user'               : user,
            }, 'identity');
        }).then(auth => {
            // 如果用户未绑定手机号, 则执行绑定手机号
            if (!auth) {
                const salt = password ? Helper.randomWord() : '';
                const credential = password ? Helper.encrypt(password, salt) : password;
                return (new UserAuthModel({
                    user    : {_id: user._id},
                    identity: {
                        identifier: phone,
                        genre     : 'phone',
                        salt      : salt,
                        credential: credential,
                    }
                })).save();
            }
            const {credential, salt} = auth.identity;
            if (credential !== Helper.encrypt(password, salt)) {
                return UserRedis.lock(phone).then(lock => {
                    return bluebird.reject({
                        lock,
                        message: 'password error',
                    });
                });
            } else {
                // 修改手机号
                auth.identity.identifier = phone;
                return auth.save();
            }
        }).then(auth => {
            // 异步的修改user表手机号
            Promise.resolve().then(() => {
                return this.update({_id: auth.user._id}, {
                    $set: {
                        phone: phone
                    }
                });
            }).catch(err => logger.info(`sync user phone with err -> ${err}`));
            Promise.resolve().then(() => {
                return UserRedis.unlock(phone);
            }).catch(err => logger.info(`unlock account for check password with err -> ${err}`));
            return auth.user._id.toString();
        }).catch(err => bluebird.reject(err));
    },

    /**
     * 获取用户基本信息
     * @param unique 用户id
     * @returns {Promise}
     */
    getBaseInfo(unique) {
        return this.findById(unique, 'nickname avatar phone role').then(user => {
            if (!user) {
                return bluebird.reject('user not exist');
            }
            return user;
        }).catch(err => bluebird.reject(err));
    },
};

export default Statics;