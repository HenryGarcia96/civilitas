export default() => ({
    jwt: {
        secret: process.env.JWT_SECRET || 'mySecretKey',
        expireIn: process.env.JWT_EXPIRES_IN || '7d'
    }
})