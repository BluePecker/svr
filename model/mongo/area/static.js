import bluebird from 'bluebird';

const Statics = {
    // 只有在项目初始化时调用
    import(area, father) {
        Object.keys(area).forEach(name => {
            let doc = {
                code  : area[name].id || '',
                name  : {
                    cn: name,
                    en: area[name].en || '',
                },
                status: true,
            };
            father && (doc.father = father);
            return (new this(doc)).save().then(doc => {
                if (!area[name].id && !area[name].en) {
                    return this.import(area[name], {_id: doc._id});
                }
            }).catch(err => bluebird.reject(err));
        });
    },

    // 原始数据
    metadata() {
        return require('./area.json');
    },

    // 地区树结构 todo 优化精简结构
    tree() {
        return this.find({status: true}, 'name code father').then(docs => {
            return JSON.parse(JSON.stringify(docs));
        }).then(docs => {
            let obj = {};
            docs.forEach(item => {
                item.son = [];
                obj[item._id] = item;
            });
            return obj;
        }).then(docs => {
            Object.keys(docs).forEach(key => {
                docs[key].father = docs[key].father || {};
                let pid = docs[key].father._id;
                docs[pid] && docs[pid].son.push(docs[key]);
            });
            return docs;
        }).then(docs => {
            let container = [];
            Object.keys(docs).forEach(key => {
                !docs[key].father._id && container.push(docs[key]);
            });
            return container;
        }).catch(err => bluebird.reject(err));
    },
};

export default Statics;
