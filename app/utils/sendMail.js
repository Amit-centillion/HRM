const sgMail = require('@sendgrid/mail');
sgMail.setApiKey("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");
// import { mailLoggerModel } from '../models';
// import { CONSTANTS } from '../constants';
// const {
//   MAILSTATUS: { FAILED },
// } = CONSTANTS;
const sendMail = async (to, from, subject, html) => {
  try {
    const sendMailObj = {
      to,
      from,
      // cc: process.env.ADMIN_EMAIL,
      subject,
      html,
    };
    const sendMail = await sgMail.send(sendMailObj);
    let insertObj = {
      to,
      from,
      subject,
    };
    if (sendMail[0].statusCode != 202) {
      insertObj = {
        ...insertObj,
        status: FAILED,
      };
    }

    // const mailLoggerObj = new mailLoggerModel(insertObj);
    // await mailLoggerObj.save();
    return sendMail;
  } catch (error) {
    if (error.response) {
      return error.response.body;
    }
  }
};

// export default sendMail;
module.exports = {
  sendMail,
};
