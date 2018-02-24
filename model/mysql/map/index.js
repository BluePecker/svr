/**
 * @typedef {{STRING:string,INTEGER:int}} sequelize
 */
import sequelize from 'sequelize';
import mysql from '../index';

export default mysql.define('tag_map', {
    tagname   : sequelize.STRING,
    ctrlType  : sequelize.STRING,
    tagNameSet: sequelize.STRING,
    dataType  : sequelize.STRING,
    areaId    : sequelize.STRING,
    fieldname : sequelize.STRING,
    unit      : sequelize.STRING,
    comment   : sequelize.STRING,
}, {
    timestamps     : true,
    freezeTableName: true,
    createAt       : 'createtime',
    updatedAt      : 'updatetime',
});