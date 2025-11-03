import Mailgen from "mailgen";
import nodemailer from "nodemailer";
// These options will be passed to sendEmail function
const sendEmail = async(options)=> {
 const mailGenerator =  new Mailgen({
theme : "default",
product : {
name : "TaskStack",
link : "http://localhost:3000/"
}
})

 const emailTextual =  mailGenerator.generatePlaintext(options.mailgenContent)
 const emailHTML =  mailGenerator.generate(options.mailgenContent)

// This is reference from Mailtrap documentation and nodemailer documentation
  const transporter = nodemailer.createTransport({ // configure mailtrap
host : process.env.MAILTRAP_SMTP_HOST,
port : process.env.MAILTRAP_SMTP_PORT,
auth : {
user : process.env.MAILTRAP_SMTP_USER,
pass : process.env.MAILTRAP_SMTP_PASSWORD
}


})

const mail =  {
from :"mail.task@example.com",
to : options.email,
subject : options.subject,
text : emailTextual,
html : emailHTML
}

try {
    await transporter.sendMail(mail)
} catch (error) {
    console.error("Error sending email: Make sure Mailtrap is configured correctly", error)
}


}



// Function to generate email content for email verification
// Took reference from mailgen documentation
const emailVerficationMailgenContent = (username, verifcationURL) => {
return {
body : {
name : username,
intro : "Welcome to Our Service! We're excited to have you on board!!",
action : {
instructions : "please verify your email address by clicking the button below:",
button : {
text : "Verify Email",
color: '#22BC66',
link : verifcationURL
}
},
 outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'


}

}
}



// Function to generate email content for password reset
// Took reference from mailgen documentation
const forgotPasswordMailgenContent = (username, passwordResetURL) => {
return {
body : {
name : username,
intro : "You have requested to reset your password!!",
action : {
instructions : "please reset your password by clicking the button below:",
button : {
text : "Reset Password",
color: '#22BC66',
link : passwordResetURL
}
},
 outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'


}

}
}

export {emailVerficationMailgenContent, forgotPasswordMailgenContent,sendEmail};