/**
 * Created by shuc on 17/9/7.
 */
import Log4js from 'log4js';
import mongoose from 'mongoose';

import UserRedis from '../model/redis/user';
import Helper from '../utils/helper';

class Boot {

    static allowRoute() {
        return [
            '/v1/captcha/render',
            '/v1/captcha/render/*',
            '/v1/sms/scan/*',
            '/v1/sms/send',
            '/v1/user/sign_up',
            '/v1/user/sign_in',
            '/v1/storage/scan/*',
        ];
    }

    authentication = async (ctx, next) => {
        const allowed = Boot.allowRoute().some(route => {
            return !!ctx.url.match(new RegExp(route));
        });

        if (!ctx.headers['json-web-token'] && !allowed) {
            ctx.status = 403;
        } else if (allowed) {
            await next();
        } else {
            const jwt = ctx.header['json-web-token'];
            await Helper.useAuth(jwt).then(data => {
                return UserRedis.role(data.unique).then(role => {
                    data.role = role;
                    return data;
                });
            }).then(data => {
                ctx.user = {
                    role: data.role,
                    _id : mongoose.Types.ObjectId(data.unique)
                };
            }).catch(() => {
                ctx.status = 403;
            });
            ctx.status !== 403 && await next();
        }
    };

    header = async (ctx, next) => {
        const start = Date.now();
        await next();
        ctx.set('Charset', 'utf-8');
        ctx.set('Content-Type', 'application/json');
        ctx.set('X-Response-Time', `${Date.now() - start}ms`);
    };

    logger = async (ctx, next) => {
        const start = Date.now();
        await next();
        const ms = Date.now() - start;
        Log4js.getLogger('koa').info('%s %s %s - %sms', ctx.status, ctx.method, ctx.url, ms);
    };
}

export default new Boot();