export default () => ({

    url: process.env.SERVER_URL,
    client_url: process.env.CLIENT_URL,

    db: {
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_DATABASE,
    },

    ftAuth: {
        cliendid: process.env.CLIENT_ID,
        secret: process.env.CLIENT_SECRET,
        callbackurl: process.env.CLIENT_CALLBACK,
    },

    jwt: {
        secret: process.env.JWT_SECRET,
        expiresin: process.env.JWT_EXPIRES_IN
    },

    mailer: {
        email: process.env.MAILER_EMAIL,
        password: process.env.MAILER_PASSWORD,
    },
});