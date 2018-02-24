/**
 * @typedef {{STRING:string,INTEGER:int}} sequelize
 */
import sequelize from 'sequelize';
import mysql from '../index';

export default mysql.define('sub_area', {
    name       : sequelize.STRING,
    pId        : sequelize.INTEGER,
    districtId : sequelize.INTEGER,
    webTemplate: sequelize.INTEGER,
}, {
    timestamps     : true,
    freezeTableName: true,
    createAt       : 'createtime',
    updatedAt      : 'updatetime',
});
