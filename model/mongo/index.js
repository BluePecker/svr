/**
 * Created by shuc on 17/8/7.
 */
import Mongoose from 'mongoose';
import Config from 'config';
import Log4js from 'log4js';
import Builder from 'mongodb-uri';

const options = Config.get('Database.mongo') || {};
const auth = Builder.format(options);
const logger = Log4js.getLogger('koa');
// to fix build in promise bug
Mongoose.Promise = require('bluebird');

Mongoose.connect(auth, {useMongoClient: true}).then(() => {
    "use strict";
    logger.info(`MONGO: Successfully connected to ${auth}`);
}, err => {
    "use strict";
    logger.error(`MONGO: Unable to connected for err -> ${err}`);
});

export default Mongoose;
