export default () => ({

    ftAuth: {
        cliendid: process.env.CLIENT_ID,
        secret: process.env.CLIENT_SECRET,
        callbackurl: process.env.CLIENT_CALLBACK,
    }
});