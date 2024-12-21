const nodemailer = require('nodemailer')

module.exports.sendMail =() => {
    module.exports.sendMail = (email, subject, html) => {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: "codean10032004@gmail.com",
              pass: "dscrqmrocacxbvvu"
            }
          });
          
          const mailOptions = {
            from: "codean10032004@gmail.com",
            to: email,
            subject: subject,
            html: html
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
           console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
              // do something useful
            }
          });
    }
}