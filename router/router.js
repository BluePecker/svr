/**
 * Created by shuc on 17/8/6.
 */
import KoaRouter from 'koa-router';

function* entries(obj) {
    for (let key of Object.keys(obj)) {
        yield [key, obj[key]];
    }
}

class Router extends KoaRouter {
    constructor(name, opt) {
        opt = opt || {};
        opt.prefix = opt.prefix || `/${(name || '').split('/')[0]}`;
        super(opt);
        const service = require(`../service/${name}`).default;
        const methods = ['options', 'head', 'get', 'put', 'patch', 'post', 'delete'];

        for (let [method, routes] of entries(opt)) {
            if (methods.indexOf(method.toLowerCase()) > 0) {
                for (let [route, func] of entries(routes)) {
                    func = typeof service === 'function' ? func : service[func];
                    this[method](route, func);
                }
            }
        }

        // interceptor
        const interceptor = {
            get: (target, name) => {
                if (typeof target[name] !== 'function') {
                    return Reflect.get(target, name);
                }
                return (...args) => {
                    if (methods.indexOf(name.toLowerCase()) > 0) {
                        if (args[1] && typeof args[1] !== 'function') {
                            args[1] = service[args[1]];
                        }
                    }
                    return Reflect.apply(target[name], target, args);
                };
            }
        };
        return new Proxy(this, interceptor);
    }

    static index() {
        const router = new KoaRouter();
        router.get('/', (ctx) => {
            ctx.body = {
                code   : 200,
                data   : {},
                message: 'winner winner,chicken dinner.'
            };
        });
        return router;
    }
}

export default Router;
