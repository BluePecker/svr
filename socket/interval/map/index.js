import Model from '../../../model/mysql/map';

class Map {
    cache = {};

    constructor() {
        this.refresh();
        setInterval(this.refresh, 30 * 60);
    }

    refresh = () => {
        return Model.findAll({
            attributes: ['id', 'ctrlType', 'areaId', 'fieldname', 'unit', 'comment']
        }).then(map => {
            map.forEach(item => {
                const key = `${item.areaId}${item.fieldname}`;
                delete item['areaId'];
                delete item['fieldname'];
                this.cache[key] = {
                    id      : item.id,
                    ctrlType: item.ctrlType,
                    unit    : item.unit,
                    comment : item.comment
                };
            });
        });
    };

    useCache = () => {
        return this.cache || {};
    };
}

export default new Map();