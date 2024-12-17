export const config = {
    jwtSecret: process.env.JWT_SECRET!,
    emailUser: process.env.EMAIL_USER!,
    emailPass: process.env.EMAIL_PASS!,
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
};