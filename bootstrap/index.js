/**
 * Created by shuc on 17/8/5.
 */
import ReadDir from 'node-dir';
import Log4js from 'log4js';
import Koa from 'koa';
import Config from 'config';
import Path from 'path-exists';
import BodyParser from 'koa-bodyparser';
import Mount from 'koa-mount';
import Router from '../router/router';
import Boot from '../middleware/boot';
import Socket from '../socket';

/**
 * @class Bootstrap
 * @property {object} app
 */
class Bootstrap {
    /**
     * construct func
     */
    constructor() {
        this.logger = Log4js.getLogger('koa');
        // get project root path
        this.root = process.cwd();
        // new app
        this.app = new Koa();
        // listen error
        this.app.on('error', err => {
            this.logger.error(`Ooh! some wrong happened -> ${err}`);
        });
        // json body parser
        this.app.use(BodyParser());
        // recorder request log
        this.app.use(Boot.logger);
        // defined response header
        this.app.use(Boot.header);
        // authentication
        this.app.use(Boot.authentication);
    }

    /**
     * logger
     */
    static logger() {
        Log4js.configure(Config.get('Logger') || {});
    }

    /**
     * starting program
     */
    start() {
        // load logger
        Bootstrap.logger();
        // init db connection by config defined
        this.storage(Config.get('Database') || {});
        // load router
        this.router();
        // get server port
        const port = Config.get('Server.port') || 3000;
        // start to listen
        const http = this.app.listen(port, () => {
            this.logger.info(`Server is listening ${port}`);
        });
        // catch http server error
        http.on('error', (err) => {
            switch (err.code) {
            case 'EADDRINUSE':
                this.logger.error(`The port has been occupied: ${err.address}:${err.port}`);
                break;
            default:
                this.logger.error(err.Error);
            }
        });

        Socket.listen(8080);
    }

    /**
     * initialize database
     * @param opts
     */
    storage(opts) {
        Object.keys(opts).forEach((driver) => {
            const name = driver.toLowerCase();
            /**
             * @typedef {object} PathCheck
             * @property {function} then
             */
            const PathCheck = Path(`${this.root}/model/${name}`);
            PathCheck.then(() => {
                require(`${this.root}/model/${name}`);
            }).catch(err => {
                this.logger.error(`db model not exist, error -> ${err}`);
            });
        });
    }

    /**
     * auto load router
     */
    router() {
        // check is router
        const val = (route) => {
            return Reflect.getPrototypeOf(route) === Router.prototype;
        };

        // traverse the router directory
        ReadDir.subdirs(`${this.root}/router`, (err, dirs) => {
            dirs.forEach(dir => {
                const routes = require(dir);
                Object.keys(routes).forEach(name => {
                    const route = routes[name];
                    if (!(typeof route === 'object' && val(route))) {
                        return false;
                    }
                    name = name.toLowerCase();
                    // for default/route route
                    (name === 'default' || name === 'route') && (name = 'v1');
                    // for version
                    this.app.use(Mount(`/${name}`, route.middleware()));
                    this.app.use(route.allowedMethods());
                });
            });
        }, 'dir');

        this.app.use(Router.index().routes());
    }
}

export default new Bootstrap();
