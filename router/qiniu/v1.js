/**
 * Created by shuc on 17/8/18.
 */
import Router from '../router';

const V1 = new Router('qiniu', {
    get: {
        '/token': 'token'
    }
});

//noinspection JSUnusedGlobalSymbols
export default V1;