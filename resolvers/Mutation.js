const { authorizeWithGithub } = require("../libs");
const fetch = require("node-fetch");
const { ObjectID } = require("mongodb");

module.exports = {
    // 发布照片
    async postPhoto(parent, args, { db, currentUser }) {
        if (!currentUser) {
            throw new Error("仅有授权用户才可发布照片");
        }

        const newPhoto = {
            ...args.input,
            userID: currentUser.githubLogin,
            created: new Date()
        };

        const { insertedIds } = await db.collection("photos").insert(newPhoto);
        newPhoto.id = insertedIds[0];

        return newPhoto;
    },
    // 标记照片
    async tagPhoto(parent, args, { db }) {
        await db.collection("tags").replaceOne(args, args, { upsert: true });

        await db.collection("photos").findOne({ _id: ObjectID(args.photoID) });
    },
    // github授权
    async githubAuth(parent, { code }, { db }) {
        // 1.从Github获取数据
        let {
            message,
            access_token,
            avatar_url,
            login,
            name
        } = await authorizeWithGithub({
            client_id: process.env.CLIENT_ID, // <YOUR_CLIENT_ID_HERE>
            client_secret: process.env.CLIENT_SECRET, //<YOUR_CLIENT_SECRET_HERE>
            code
        });
        // 2.如果有message，那就说明出错了
        if (message) {
            throw new Error(message);
        }
        // 3.将结果封装到一个对象中
        let latestUserInfo = {
            name,
            githubLogin: login,
            githubToken: access_token,
            avatar: avatar_url
        };
        // 4.根据新的信息新增或是更新记录
        const {
            ops: [user]
        } = await db
            .collection("users")
            .replaceOne({ githubLogin: login }, latestUserInfo, {
                upsert: true
            });
        // 5.返回用户数据和token
        return { user, token: access_token };
    },
    // 添加虚假用户
    async addFakeUsers(parent, { count }, { db }) {
        var randomUserApi = `https://randomuser.me/api/?results=${count}`;

        var { results } = await fetch(randomUserApi).then(res => res.json());

        var users = results.map(r => ({
            githubLogin: r.login.username,
            name: `${r.name.first} ${r.name.last}`,
            avatar: r.picture.thumbnail,
            githubToken: r.login.sha1
        }));

        await db.collection("users").insert(users);

        return users;
    },
    // 虚假授权
    async fakeUserAuth(parent, { githubLogin }, { db }) {
        var user = await db.collection("users").findOne({ githubLogin });

        if (!user) {
            throw new Error(
                `未找到通过${githubLogin}进行githubLogin登录的用户`
            );
        }

        return {
            token: user.githubToken,
            user
        };
    }
};
