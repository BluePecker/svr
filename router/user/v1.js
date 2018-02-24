/**
 * Created by shuc on 17/8/18.
 */
import Router from '../router';

const V1 = new Router('user', {
    post: {
        '/sign_up'       : 'signUpByPhone',
        '/sign_in'       : 'signInByPhone',
        '/reset/phone'   : 'resetPhone',
        '/reset/password': 'resetPassword',
    },
    get : {
        '/info': 'information'
    }
});

//noinspection JSUnusedGlobalSymbols
export default V1;