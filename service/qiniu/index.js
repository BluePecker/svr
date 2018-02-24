/**
 * Created by shuc on 17/8/18.
 */
import Qiniu from 'qiniu';
import Config from 'config';
import Service from '../index';

class QiniuService extends Service {

    token = () => {
        /**
         * @typedef {{key:{access: string, secret: string}}} qiniu
         */
        const qiniu = Config.get('Qiniu') || {};
        const mac = new Qiniu.auth.digest.Mac(qiniu.key.access, qiniu.key.secret);
        this.success({
            token: (new Qiniu.rs.PutPolicy({
                // 上传凭证有效期60分钟
                expires: 2 * 60 * 60,
                scope  : qiniu.bucket
            })).uploadToken(mac)
        });
    }
}

//noinspection JSUnusedGlobalSymbols
export default new QiniuService();