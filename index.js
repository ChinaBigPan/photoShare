const { ApolloServer, PubSub } = require("apollo-server-express");
const express = require("express");
const expressPlayground = require("graphql-playground-middleware-express")
    .default;
const { readFileSync } = require("fs");
const typeDefs = readFileSync("./typeDefs.graphql", "UTF-8");
const resolvers = require("./resolvers");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
const { createServer } = require("http");
dotenv.config();

// 1.创建异步函数（asynchronous）函数
async function start() {
    const app = express();
    // 2.设置环境变量
    const MONGO_DB = process.env.DB_HOST;
    let db;

    try {
        const client = await MongoClient.connect(MONGO_DB, {
            useNewUrlParser: true
        });
        db = client.db();
    } catch (error) {
        console.log(`
            未发现数据库，请再.env文件中添加DB_HOST环境变量。
            退出中...
        `);
        process.exit(1);
    }

    const pubsub = new PubSub();
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: async ({ req, connection }) => {
            const githubToken = req
                ? req.headers.authorization
                : connection.context.Authorization;
            const currentUser = await db
                .collection("users")
                .findOne({ githubToken });
            return { db, currentUser, pubsub };
        }
    });
    server.applyMiddleware({ app });
    // 4. 配置路由
    app.get("/", (req, res) => {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }); // 设置utf-8
        let url = `https://github.com/login/oauth/authorize?client_id=${
            process.env.CLIENT_ID
        }&scope=user`;
        res.end(`<a href="${url}">通过gitHub登录</a>`);
    });

    app.get(
        "/playground",
        expressPlayground({
            endpoint: "/graphql"
        })
    );

    const port = 4000;
    const httpServer = createServer(app);
    server.installSubscriptionHandlers(httpServer);
    httpServer.listen({ port }, () =>
        console.log(
            `GraphQL 服务运行于 localhost:${port}, 地址为${server.graphqlPath}`
        )
    );
}
// 准备就绪后启动
start();
