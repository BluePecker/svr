import Builder from 'parse-dburi';
import Config from 'config';
import Sequelize from 'sequelize';
import Log4js from 'log4js';

const auth = Builder.stringify(Config.get('Database.mysql') || {});
const sequelize = new Sequelize(auth, {pool: {min: 0, max: 50}, logging: false, operatorsAliases: false});
const logger = Log4js.getLogger('koa');

sequelize.authenticate().then(() => {
    "use strict";
    logger.info(`MYSQL: Successfully connected to ${auth}`);
}).catch(err => {
    "use strict";
    logger.error(`MYSQL: Unable to connected for err -> ${err}`);
});

export default sequelize;