/**
 * @typedef {{STRING:string,INTEGER:int,DOUBLE}} sequelize
 */
import sequelize from 'sequelize';
import mysql from '../index';

export default mysql.define('control_point', {
    tagName : sequelize.STRING,
    value   : sequelize.DOUBLE(32, 4),
    dataType: sequelize.STRING,
}, {
    timestamps     : true,
    freezeTableName: true,
    createAt       : 'createtime',
    updatedAt      : 'updatetime',
});