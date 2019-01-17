// 1. 引入 "apollo-server"
const { ApolloServer } = require('apollo-server');

const typeDefs =`
    enum PhotoCategory {
        SELFIE
        PORTRAIT
        ACTION
        LANDSCAPE
        GRAPHIC
    }
    type Photo {
        id: ID!
        url: String!
        name: String!
        description: PhotoCategory
    }
    type Query {
        totalPhotos: Int!
        allPhotos: [Photo!]!
    }
    input PostPhotoInput {
        name: String!
        category: PhotoCategory = PORTRAIT
        description: String
    }
    type Mutation {
        postPhoto(input: PostPhotoInput!): Photo!
    }
`;
// 1. 设置一个自增变量以绑定ID
var _id = 0;
var photos = [];
const resolvers = {
    Query: {
        totalPhotos: () => photos.length,
        allPhotos: () => photos
    },
    //  变更（mutation）和postPhot解析器
    Mutation: {
        postPhoto(parent, args) {
            // 2. 创建一个带有id的新对象
            var newPhoto = {
                id: _id++,
                ...args
            };
            photos.push(newPhoto);
            // 3. 返回新的照片类型
            return newPhoto;
        }
    }
};

// 2. 创建一个新的服务器实例
// 3. 并将typeDefs (schema)和接卸气作为对象参数传入
const server = new ApolloServer({
    typeDefs,
    resolvers
});


// 调用listen() 启动服务器
server
    .listen()
    .then(({ url }) => console.log(`GraphQL服务运行于${ url }`));










