// const nodemailer = require("nodemailer");

// const sendMail = async (to, subject, body) => {
//   try {
//     // Validate environment variables
//     if (!process.env.MY_EMAIL || !process.env.EMAIL_PASSKEY) {
//       throw new Error("Email credentials are not set in environment variables.");
//     }

//     const transporter = nodemailer.createTransport({
//       host: "smtp.gmail.com", // Corrected host
//       port: 587, // Port for TLS
//       secure: false, // Use TLS
//       auth: {
//         user: process.env.MY_EMAIL,
//         pass: process.env.EMAIL_PASSKEY,
//       },
//     });

//     const info = await transporter.sendMail({
//       from: process.env.MY_EMAIL, // sender address
//       to: to, // list of receivers
//       subject: subject, // Subject line
//       text: body, // plain text body
//     });

//     console.log("Message sent: %s", info.messageId);
//   } catch (error) {
//     console.error("Error sending email:", error.message);
//     throw error; // Re-throw the error for further handling
//   }
// };

// module.exports = sendMail;