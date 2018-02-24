/**
 * Created by shuc on 17/8/18.
 */
import Router from '../router';

const V1 = new Router('captcha', {
    get: {
        '/render'               : 'render',
        '/render/:width/:height': 'render',
    }
});

//noinspection JSUnusedGlobalSymbols
export default V1;