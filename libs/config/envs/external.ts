export const strategy = {
  mail: {
    mailSender: process.env.MAIL_SENDER || 'mail@mail.com',
    sendGridKey: process.env.SG_API_KEY || 'key',
    template: {
      verifyEmail: process.env.SG_TEMPLATE_VERIFY || 'template_id',
      resetPassword: process.env.SG_TEMPLATE_RESET_PWD || 'template_id',
    },
  },
  strategy: {
    facebook: {
      clientID: process.env.FB_CLIENT_ID,
      clientSecret: process.env.FB_CLIENT_SECRET,
      callbackURL: process.env.FB_CALLBACK_URL,
    },
    google: {
      clientID: process.env.GG_CLIENT_ID,
      clientSecret: process.env.GG_CLIENT_SECRET,
      callbackURL: process.env.GG_CALLBACK_URL,
    }
  },
};
