const { GraphQLScalarType } = require("graphql");

// 1. 设置一个自增变量以绑定ID
var _id = 0;
const resolvers = {
    Query: {
        totalPhotos: () => photos.length,
        // allPhotos: () => photos
        allPhotos: (parent, args) => {
            let after = args.after; // <- 传进来的Date对象
            console.log("日期对象", after);
            return photos;
        }
    },
    //  变更（mutation）和postPhot解析器
    Mutation: {
        postPhoto(parent, args) {
            // 2. 创建一个带有id的新对象
            var newPhoto = {
                id: _id++,
                ...args.input,
                created: new Date()
            };
            photos.push(newPhoto);
            // 3. 返回新的照片类型
            return newPhoto;
        }
    },
    Photo: {
        url: parent => `http://yoursite.com./img/${parent.id}.jpg`,
        postedBy: parent => {
            return users.find(u => u.githubLogin === parent.githubUser);
        },
        taggedUsers: parent =>
            tags
                // 返回一个仅包含当前照片的标签数组
                .filter(tag => tag.photoID === parent.id)
                // 将标签数组转换为用户ID数组
                .map(tag => tag.userID)
                // 将用户ID数组转换为用户对象数组
                .map(userID => users.find(u => u.githubLogin === userID))
    },
    User: {
        postedPhotos: parent => {
            return photos.filter(p => p.githubUser === parent.githubLogin);
        },
        inPhotos: parent =>
            tags
                // 返回一个仅包含当前用户的标签数组
                .filter(tag => tag.userID === parent.id)
                // 将标签数组转换为照片ID数组
                .map(tag => tag.photoID)
                // 将照片ID数组转换为照片对象数组
                .map(photoID => photos.find(p => p.id === photoID))
    },
    DateTime: new GraphQLScalarType({
        name: "DateTime",
        description: "合法的日期时间值",
        parseValue: value => new Date(value),
        serialize: value => new Date(value).toISOString(),
        parseLiteral: ast => ast.value
    })
};

module.exports = resolvers;
