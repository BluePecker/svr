/**
 * Created by shuc on 17/8/18.
 */
import Router from '../router';

const V1 = new Router('sms', {
    post: {
        '/send': 'send',
    },
    get : {
        '/scan/:phone': 'scan',
    }
});

//noinspection JSUnusedGlobalSymbols
export default V1;