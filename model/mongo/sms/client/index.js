import bluebird from 'bluebird';
import AliSms from './ali';

class SmsClient {
    client = {};

    register = (name, client) => {
        this.client[name] = client;
    };

    send = (type, phone, param) => {
        return this.allot().send(type, phone, param).then(res => {
            let {Code, Message, BizId} = res;
            return {Code, Message, BizId, Channel: this.Channel};
        }).catch(err => {
            return bluebird.reject(JSON.stringify({Channel: this.Channel, data: err}));
        });
    };

    allot = () => {
        this.Channel = 'AliSms';
        return this.client[this.Channel];
    };
}

const Client = new SmsClient();

Client.register('AliSms', new AliSms('FmusNu6zirrizgDe', 'nn7fETcdYUXoSAxbLieErrgRb1vbWm'));

export default Client;