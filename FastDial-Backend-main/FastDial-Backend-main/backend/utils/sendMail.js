const nodemailer = require('nodemailer');
console.log(process.env.EMAIL_USER);

const transporter = nodemailer.createTransport({        
  service: process.env.EMAIL_SERVICE || 'gmail',

  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});


const sendMail = async (options) => {

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    ...options,
  };
  return transporter.sendMail(mailOptions);
};

module.exports = sendMail; 