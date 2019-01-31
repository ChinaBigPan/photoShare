
const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const expressPlayground = require("graphql-playground-middleware-express")
    .default;
const { readFileSync } = require("fs");
const typeDefs = readFileSync("./typeDefs.graphql", "UTF-8");
const resolvers = require("./resolvers");

const app = express();

const server = new ApolloServer({
    typeDefs,
    resolvers
});

server.applyMiddleware({ app });

app.get("/", (req, res) => {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }); // 设置utf-8
    res.end("欢迎来到我们的照片分享API");
});

app.get("/playground", expressPlayground({
    endpoint: "/graphql"
}));

const port = 4000;
app.listen({ port }, () => {
    console.log(`GraphQL服务运行于http://localhost:${port}, 路径为${server.graphqlPath}`);
});
