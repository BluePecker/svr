/**
 * Created by shuc on 17/8/18.
 */
import Router from '../router';

const V1 = new Router('object', {
    post: {
        '/save': 'save'
    },
    get : {
        '/scan/:_id': 'scan'
    }
});

//noinspection JSUnusedGlobalSymbols
export default V1;