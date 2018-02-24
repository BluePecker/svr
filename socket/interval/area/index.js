import Model from '../../../model/mysql/area';

class Area {
    cache = {};

    constructor() {
        this.refresh();
        setInterval(this.refresh, 30 * 60);
    }

    refresh = () => {
        return Model.findAll({
            attributes: ['id', 'name']
        }).then(map => {
            map.forEach(item => {
                this.cache[item.id] = item.name;
            });
        });
    };

    useCache = () => {
        return this.cache || {};
    };
}

export default new Area();