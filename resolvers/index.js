const Query = require("./Query");
const Mutation = require("./Mutation");
const Type = require("./Types");

const resolvers = {
    Query,
    Mutation,
    ...Type
};

module.exports = resolvers;
