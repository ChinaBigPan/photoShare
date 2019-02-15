const fetch = require("node-fetch");
const fs = require("fs");

const findBy = (value, array, field = "id") =>
    array[array.map(item => item[field]).indexOf(value)];

const generateFakeUsers = count =>
    fetch(`https://randomuser.me/api/?results=${count}`).then(res =>
        res.json()
    );

// 获取GitHub Token
const requestGithubToken = credentials =>
    fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: JSON.stringify(credentials)
    })
        .then(res => res.json())
        .catch(error => {
            throw new Error(JSON.stringify(error));
        });

// 请求Github用户账号访问信息
const requestGithubUserAccount = token =>
    fetch(`https://api.github.com/user?access_token=${token}`)
        .then(res => res.json())
        .catch(error => {
            throw new Error(JSON.stringify(error));
        });

/**
 * 授权
 * @param {Object} credentials - 认证参数
 */
const authorizeWithGithub = async credentials => {
    const { access_token } = await requestGithubToken(credentials);
    const githubUser = await requestGithubUserAccount(access_token);
    return { ...githubUser, access_token };
};


const uploadStream = (stream, path) =>
    new Promise((resolve, reject) => {
        stream.on("error", error => {
                if (stream.truncated) {
                    fs.unlinkSync(path);
                }
                reject(error);
            }).on("end", resolve)
            .pipe(fs.createWriteStream(path));
    });

// const saveFile = (stream, path) =>
//     new Promise((resolve, reject) => {
//         stream.on('error', error => {
//             if (stream.truncated) {
//                 fs.unlinkSync(path)
//             }
//             reject(error)
//         }).on('end', resolve)
//             .pipe(fs.createWriteStream(path))
//     })

// const uploadFile = async (file, path) => {
//     const { stream } = await file
//     return saveFile(stream, path)
// }

module.exports = {
    findBy,
    authorizeWithGithub,
    generateFakeUsers,
    uploadStream
};
