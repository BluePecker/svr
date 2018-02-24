import Captcha from "svg-captcha";

import Service from "../index";
import CaptchaRedis from "../../model/redis/captcha";

class CaptchaService extends Service {

    //noinspection JSUnusedGlobalSymbols
    /**
     * 渲染验证码
     * @param ctx
     * @returns {*}
     */
    render = (ctx) => {
        const {width, height} = ctx.params;
        Captcha.options.width = width || 200;
        Captcha.options.height = height || 50;
        const captcha = Captcha.create();
        // 三分钟内验证有效
        return CaptchaRedis.save(captcha.text).then(unique => {
            return this.success({
                unique,
                captcha: captcha.data,
            });
        }).catch(err => {
            return this.failure(err);
        });
    }
}

//noinspection JSUnusedGlobalSymbols
export default new CaptchaService();