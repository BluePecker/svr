/**
 * @typedef {{on:function,listen:function}} io
 */
import Log4js from 'log4js';
import sequelize from 'sequelize';
import Mysql from '../model/mysql';
/**
 * @typedef {{findAll:function}} Area
 */
import AreaModel from '../model/mysql/area';
import MapModel from '../model/mysql/map';
import MonitorModel from '../model/mysql/monitor';
import ControlModel from '../model/mysql/control';

import Map from './interval/map';
import Area from './interval/area';

const io = require('socket.io')();

const logger = Log4js.getLogger('logic');

io.on('connection', socket => {
    socket.on('disconnect', data => {
        logger.info('disconnect ->' + JSON.stringify(data));
    });

    /**
     * 获取小区实时数据
     * @param int communityId 小区ID
     */
    socket.on('sync', data => {
        const {communityId} = data;
        AreaModel.findAll({
            attributes: ['id'],
            where     : {pId: communityId},
        }).then(areas => {
            return areas.map(item => item.id);
        }).then(ids => {
            return Mysql.query('SELECT * FROM monitor_point WHERE id in (SELECT DISTINCT(id) FROM (SELECT * FROM monitor_point WHERE areaId IN(:ids) ORDER BY createtime DESC LIMIT :len) as m)', {
                model       : MonitorModel,
                replacements: {
                    ids,
                    len: ids.length
                },
                type        : sequelize.QueryTypes.SELECT,
            }).then(monitors => {
                const map = Map.useCache();
                return JSON.parse(JSON.stringify(monitors)).map(item => {
                    let temp = {};
                    Object.keys(item).forEach(key => {
                        item[key] = Object.assign(map[`${item.areaId.value}${key}`] || {
                            ctrlType: '',
                            id      : '',
                            unit    : '',
                            comment : '',
                        }, {
                            value: item[key],
                        });
                        if ((item[key].value !== '' && item[key].comment !== '')
                            || ['id', 'updatetime', 'areaId'].indexOf(key) >= 0
                        ) {
                            temp[key] = item[key];
                        }
                    });
                    return temp;
                });
            }).then(monitors => {
                let metadata = {common: {}, area: []};
                // 处理数据的分区
                const area = Area.useCache();
                monitors.map(item => {
                    item['areaId']['comment'] = area[item['areaId']['value']];
                    return item;
                }).map(item => {
                    const data = {
                        id        : item['id'].value,
                        updateTime: item['updatetime'].value,
                        area      : item['areaId'].comment
                    };

                    delete item['updatetime'];
                    delete item['id'];
                    if (item['areaId']['comment'] === '集成区') {
                        delete item['areaId'];
                        metadata.common = Object.assign(data, {metadata: item});
                    } else {
                        delete item['areaId'];
                        metadata.area.push(Object.assign(data, {metadata: item}));
                    }
                });
                const temp = {
                    '一区': 1,
                    '二区': 2,
                    '三区': 3,
                    '四区': 4,
                    '五区': 5,
                    '六区': 6,
                    '七区': 7,
                    '八区': 8,
                    '九区': 9,
                };
                metadata.area = metadata.area.sort((pre, nex) => {
                    return temp[pre['area']] > temp[nex['area']];
                });
                return metadata;
            });
        }).then(monitors => {
            socket.emit('sync', monitors);
        }).catch(() => socket.emit('sync', []));
    });

    /**
     * 控制仪器
     * @param int areaId 区域ID
     * @param string fieldName 字段名
     * @param mixed value 设置的对应值
     */
    socket.on('control', data => {
        const {id, value} = data;
        MapModel.findOne({
            attributes: ['tagNameSet'],
            where     : {id},
        }).then(map => {
            if (map['tagNameSet']) {
                return ControlModel.update({value}, {
                    where: {tagName: map['tagNameSet']},
                });
            }
        }).catch(err => logger.error(err));
    });
});


export default io;