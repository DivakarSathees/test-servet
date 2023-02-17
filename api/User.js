// const express = require('express')
// const router = express.Router()
// //mongodb user model
// const Bmi = require('./../models/User')

// const User = require('./../models/Bmi')

// //mongodb user verification model
// const UserVerification = require('./../models/UserVerification')

// //mongodb user password Reset model
// const PasswordReset = require('./../models/PasswordReset')

// //email handler
// const nodemailer = require("nodemailer")

// //unique string
// const {v4: uuidv4} = require("uuid")

// //env variables
// require('dotenv').config()


// //password handler
// const bcrypt = require('bcrypt')

// //path for static verified page
// const path = require("path");

// //nodemailer stuff
// let transpoter = nodemailer.createTransport({
//     service: "hotmail",
//     auth: {
//         user: process.env.AUTH_EMAIL,
//         pass: process.env.AUTH_PASS
//     },
//     tls: {
//         rejectUnauthorized: false
//     }
// });

// //testing success
// transpoter.verify((error, success) => {
//     if(error) {
//         console.log(error)
//     }else {
//         console.log("Ready for messages")
//         console.log(success)
//     }
// })

// //sign up
// router.post('/signup', (req, res) => {
//     let {name,email,password,doB} = req.body
//     name = name.trim()
//     email = email.trim()
//     password = password.trim()
//     doB = doB.trim()
//     console.log("hai")
//     if(name == "" || email == "" || password == "" || doB == ""){
//         res.json({
//             status: "FAILED",
//             message: "Empty input field!!!"
//         })
//     }
//     else if(!/^[a-zA-Z ]*$/.test(name)){
//         res.json({
//             status: "FAILED",
//             message: "Invalid name entered"
//         })
//     }
//     else if(!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
//         res.json({
//             status: "FAILED",
//             message: "Invalid Email entered"
//         })
//     }
//     else if(!new Date(doB).getTime()){
//         res.json({
//             status: "FAILED",
//             message: "Invalid date of birth entered"
//         })
//     }
//     else if(password.length < 8){
//         res.json({
//             status: "FAILED",
//             message: "Password is too short!!!"
//         })
//     }
//     else{
//         User.find({email}).then(result => {
//             if(result.length){
//                 res.json({
//                     status: "FAILED",
//                     message: "User with the provided email already exists!!!"
//                 })
//             }
//             else{//try to create new user
//                 // password handling
//                 const saltRounds = 10
//                 bcrypt.hash(password, saltRounds).then(hashedPassword => {
//                     const newUser = new User({
//                         name,
//                         email,
//                         password: hashedPassword,
//                         doB,
//                         verified: false
//                     })
//                     newUser.save().then(result => {
//                         res.json({
//                             status: "SUCCESS",
//                             message: "Sign up successfull",
//                             data: result,
//                         })
//                         //handle account verfication
//                         // sendVerficationEmail(result, res);
//                     })
//                     .catch(err => {
//                         res.json({
//                             status: "FAILED",
//                             message: "An error occurred while saving user account"
//                         })
//                     })
//                 })
//             }
//         }).catch(err => {
//             console.log(err)
//             res.json({
//                 status: "FAILED",
//                 message: "An error occurred while checking for existing user"
//             })
//         })
//     }
// });
// console.log("hai")


// //send verification email
// const sendVerficationEmail = ({_id, email}, res) => {
//     //url to be used in the email
//     const currentUrl = "https://ancient-chamber-26587.herokuapp.com/";
//     // const currentUrl = "https://hjk-app.herokuapp.com/";

//     const uniqueString = uuidv4() + _id;

//     //mail optionsd
//     const mailOptions = {
//         from: process.env.AUTH_EMAIL,
//         to: email,
//         subject: "Verify Your Email",
//         html: `<p>Verify your email address to complete the signup and login into your account.</p><p>This link <b>expires in 6 hours</b>.</p><p>Press <a href=${currentUrl + "user/verify/" + _id + "/" + uniqueString}>here</a> to proceed.</p>`
//     };
//     //hash the uniqueString
//     const saltRounds = 10;
//     bcrypt
//         .hash(uniqueString, saltRounds)
//         .then((hashedUniqueString) => {
//             //set values in userVerification collection
//             const newVerification = new UserVerification({
//                 userId: _id,
//                 uniqueString: hashedUniqueString,
//                 createdAt:Date.now(),
//                 expiresAt: Date.now() + 21600000,
//             });
//             newVerification
//                 .save()
//                 .then(() => {
//                     transpoter
//                         .sendMail(mailOptions)
//                         .then(() => {
//                             //email sent and verification record saved
//                             res.json({
//                                 status: "PENDING",
//                                 message: "Verification email sent"
//                             });
//                         })
//                         .catch((error) => {
//                             console.log(error);
//                             res.json({
//                                 status: "FAILED",
//                                 message: "Verification email failed"
//                             })
//                         })
//                 })
//                 .catch((error) => {
//                     console.log(error);
//                     res.json({
//                         status: "FAILED",
//                         message: "Couldn't save verofication email data!",
//                     })
//                 })
//         })
//         .catch(() => {
//             res.json({
//                 status: "FAILED",
//                 message: "An error occurred while hashing email data!"
//             })
//         })
// };

// // verify email
// router.get("/verify/:userId/:uniqueString", (req, res) => {
//     let { userId, uniqueString } = req.params;

//     UserVerification
//         .find({userId})
//         .then((result) => {
//             if (result.length > 0) {
//                 //user verification record exists so we proceed
//                 const {expiresAt} = result[0];
//                 const hashedUniqueString = result[0].uniqueString;

//                 //checking for expired unique string
//                 if(expiresAt < Date.now()){
//                     //record has expired so we delete it
//                     UserVerification
//                         .deleteOne({ userId })
//                         .then(result => {
//                             User
//                                 .deleteOne({_id: userId})
//                                 .then(()=> {
//                                     let message = "Link has expired. please sign up again."
//                                     res.redirect(`/user/verified/error=true&message=${message}`);
//                                 })
//                                 .catch((error) => {
//                                     console.log(error);
//                                     let message = "Clearing user with expired unique string failed"
//                                     res.redirect(`/user/verified/error=true&message=${message}`);
//                                 })
//                         })
//                         .catch((error) => {
//                             console.log(error);
//                             let message = "An error occured while clearing expired user verification record"
//                             res.redirect(`/user/verified/error=true&message=${message}`);
//                         })
//                 } else {
//                     //valid record exists so we validate the user string
//                     // first compare the hased unique string
//                     bcrypt
//                         .compare(uniqueString, hashedUniqueString)
//                         .then(result => {
//                             if (result) {
//                                 //string match
//                                 User
//                                     .updateOne({_id: userId}, {verified: true})
//                                     .then(() => {
//                                         UserVerification
//                                             .deleteOne({userId})
//                                             .then(() => {
//                                                 res.sendFile(path.join(__dirname, "./../views/verified.html"));
//                                             })
//                                             .catch(error => {
//                                                 console.log(error);
//                                                 let message = "An error occured while finalizing successful verification."
//                                                 res.redirect(`/user/verified/error=true&message=${message}`);
//                                             })
//                                     })
//                                     .catch(error => {
//                                         console.log(error);
//                                         let message = "An error occured while updating user record to show verified."
//                                         res.redirect(`/user/verified/error=true&message=${message}`);
//                                     })
//                             } else {
//                                 //existing record but incorrect verification details passed
//                                 let message = "Invaid verification details passed. Check your inbox."
//                                 res.redirect(`/user/verified/error=true&message=${message}`);
//                             }
//                         })
//                         .catch(error => {
//                             let message = "An error occured while comparing unique strings."
//                             res.redirect(`/user/verified/error=true&message=${message}`);
//                         })
//                 }
//             } else {
//                 //user verification record doesn't exists
//                 let message = "Account record doesn't exist or has been verified already. please signin or log in."
//                 res.redirect(`/user/verified/error=true&message=${message}`); 
//             }
//         })
//         .catch((error) => {
//             console.log(error);
//             let message = "An error occured while checking for existing user verification record"
//             res.redirect(`/user/verified/error=true&message=${message}`);
//         })
// });

// //Verified page route
// router.get("/verified", (req, res) => {
//     res.sendFile(path.join(__dirname, "./../views/verified.html"));
// })


// //signin
// router.post('/signin', (req, res) => {
//     let {email,password} = req.body
//     email = email.trim()
//     password = password.trim()

//     if(email == "" || password == ""){
//         res.json({
//             status: "FAILED",
//             message: "Empty credentials"
//         })
//     } 
//     else{
//         User.find({email})
//         .then(data => {
//             if(data.length){
//                 //user exists
//                 //check if user is verified
//                 if(!data[0].verified){
//                     res.json({
//                         status: "FAILED",
//                         message: "Email hasn't been verified yet. Check your inbox.",
//                         data: data
//                     })
//                 } else {
//                     const hashedPassword = data[0].password
//                     bcrypt.compare(password, hashedPassword).then(result => {
//                     if(result){
//                         res.json({
//                             status: "SUCCESS",
//                             message: "Singin successfull",
//                             data: data
//                         })
//                     }
//                     else {
//                         res.json({
//                             status: "FAILED",
//                             message: "invalid password entered"
//                         })
//                     }
//                 })
//                 .catch(err => {
//                     console.log(err)
//                     res.json({
//                         status: "FAILED",
//                         message: "An error occurred while comparing password"
//                     })
//                 })
//                 }


                
//             }
//             else{                
//                     res.json({
//                         status: "FAILED",
//                         message: "invalid username entered"
//                     })                
//             }
//         })
//         .catch(err => {
//             res.json({
//                 status: "FAILED",
//                 message: "An error occurred while checking for existing user"
//             })
//         })
//     }


// });

// //Password reset stuff
// router.post("/requestPasswordReset", (req, res) => {
//     const {email, redirectUrl} = req.body;
//     //check if email exists
//     User
//         .find({email})
//         .then((data) => {
//             if(data.length){
//                 //user exists

//                 //check if user is verified
//                 if(!data[0].verified) {
//                     res.json({
//                         status: "FAILED",
//                         message: "Email hasn't been verified yet, Check your inbox"
//                     });
//                 } else {
//                     //proceed with email to reset password
//                     sendResetEmail(data[0], redirectUrl, res);
//                 }

//             } else {
//                 res.json({
//                     status: "FAILED",
//                     message: "No account with the supplied email exists!!"
//                 })
//             }
//         })
//         .catch(error => {
//             console.log(error);
//             res.json({
//                 status: "FAILED",
//                 message: "An error occurred while checking for existing user"
//             })
//         })

// })

// //send password reset email
// const sendResetEmail = ({_id, email}, redirectUrl, res) => {
//     const resetString = uuidv4() + _id;

//     //first, we clear all existing reset records
//     PasswordReset
//         .deleteMany({ userId: _id})
//         .then(result => {
//             //Reset records deleted successfully
//             //npw we send the email

//             //mail optionsd
//             const mailOptions = {
//                 from: process.env.AUTH_EMAIL,
//                 to: email,
//                 subject: "Password Reset",
//                 html: `<p>We heard that you lost the password.</p><p>Don't worry, use the below link to reset it.</p><p>This link <b>expires in 60 minutes</b>.</p><p>Press <a href=${redirectUrl + "/" + _id + "/" + resetString}>here</a> to proceed.</p>`
//             };
            
//             //hash the rset string
//             const saltRounds= 10;
//             bcrypt
//                 .hash(resetString, saltRounds)
//                 .then(hashedResetString => {
//                     //set values in password reset collection
//                     const newPasswordReset = new PasswordReset({
//                         userId: _id,
//                         resetString: hashedResetString,
//                         createdAt: Date.now(),
//                         expiresAt: Date.now() + 3600000
//                     });

//                     newPasswordReset
//                         .save()
//                         .then(() => {
//                             transpoter
//                                 .sendMail(mailOptions)
//                                 .then(() => {
//                                     // reset email sent and password reset record saved
//                                     res.json({
//                                         status: "PENDING",
//                                         message: "Password reset email sent"
//                                     });
//                                 })
//                                 .catch(error => {
//                                     console.log(error);
//                                     res.json({
//                                         status: "FAILED",
//                                         message: "Password reset email failed"
//                                     });
//                                 })
//                         })
//                         .catch(error => {
//                             console.log(error);
//                             res.json({
//                                 status: "FAILED",
//                                 message: "Couldn't save password reset data!"
//                             });
//                         })
//                 })
//                 .catch(error => {
//                     console.log(error);
//                     res.json({
//                         status: "FAILED",
//                         message: "An error occured while hashing the password reset data!"
//                     });
                    
//                 })
//         })
//         .catch(error => {
//             //error while clearing existing records
//             console.log(error);
//             res.json({
//                 status: "FAILED",
//                 message: "Clearing existing password reset records failed"
//             });
//         }) 
// }

// //Actually reset the password
// router.post("/resetPassword", (req, res) => {
//     let {userId, resetString, newPassword} = req.body;

//     PasswordReset
//         .find({userId})
//         .then(result => {
//             if(result.length > 0){
//                 //Password reset record exists so we proceed
//                 const {expiresAt} = result[0];
//                 const hashedResetString = result[0].resetString;
//                 //checking for expired reset string
//                 if (expiresAt < Date.now()){
//                     PasswordReset
//                         .deleteOne({userId})
//                         .then(() => {
//                             //Reset record deleted successfully
//                             res.json({
//                                 status: "FAILED",
//                                 message: "Password reset link has expired."
//                             })
//                         })                        
//                         .catch(error => {
//                             //deletion failed
//                             console.log(error);
//                             res.json({
//                                 status: "FAILED",
//                                 message: "Clearing  password reset record failed."
//                             });
//                         })
//                 }else{
//                     //valid reset exists so we validate the resset string
//                     // first compare the hashed reset string
//                     bcrypt
//                         .compare(resetString, hashedResetString)
//                         .then((result) => {
//                             if(result){
//                                 //string matched
//                                 //hash password again
//                                 const saltRounds =10;
//                                 bcrypt
//                                     .hash(newPassword, saltRounds)
//                                     .then(hashedNewPassword => {
//                                         //update user password
//                                         User
//                                             .updateOne({_id: userId}, {password: hashedNewPassword})
//                                             .then(() => {
//                                                 //update complete. now delete reset record
//                                                 PasswordReset
//                                                     .deleteOne({userId})
//                                                     .then(() => {
//                                                         //both user record and reset record updated
//                                                         res.json({
//                                                             status: "SUCCESS",
//                                                             message: "Password has been reset successfully."
//                                                         })
//                                                     })
//                                                     .catch(error => {
//                                                         console.log(error);
//                                                         res.json({
//                                                             status: "FAILED",
//                                                             message: "An error occured while finalizing password reset."
//                                                         })
//                                                     })
//                                             })
//                                             .catch(error => {
//                                                 console.log(error);
//                                                 res.json({
//                                                     status: "FAILED",
//                                                     message: "Updating user password failed."
//                                                 })
//                                             })
//                                     })
//                                     .catch(error => {
//                                         console.log(error);
//                                         res.json({
//                                             status: "FAILED",
//                                             message: "An error occured while hashing new password."
//                                         })
//                                     })
//                             } else {
//                                 //Existing record but incorrect reset string passed.
//                                 res.json({
//                                     status: "FAILED",
//                                     message: "Invalid password reset details passed."
//                                 })
//                             }
//                         })
//                         .catch(error => {
//                             res.json({
//                                 status: "FAILED",
//                                 message: "Comparing password reset string failed."
//                             })
//                         })
//                 }

//             }else {
//                 //password reset record doesn't exist
//                 res.json({
//                     status: "FAILED",
//                     message: "Password reset request not found."
//                 });
//             }
//         })
//         .catch(error => {
//             console.log(error);
//             res.json({
//                 status: "FAILED",
//                 message: "Checking for existing password reset failed."
//             });
//         })
// })

// // router.post('/bmi', (req, res) => {
// //     let {userId,height,weight} = req.body
// //     userId = userId.trim
// //     height = 165
// //     weight = 65
// //     const newUser = new User({
// //         height,
// //         weight
// //     })
// //     newUser.save().then(result => {
// //         res.json({
// //             status: "SUCCESS",
// //             message: "Sign up successfull",
// //             data: result,
// //         })
// // })
// // });

// // router.post('/bmi', (req, res) => {
    
// // })


// module.exports = router

const express = require('express')
const router = express.Router()
//mongodb user model
const User = require('./../models/User')

const Bmi = require('./../models/Bmi')

//mongodb user verification model
const UserVerification = require('./../models/UserVerification')

//mongodb user password Reset model
const PasswordReset = require('./../models/PasswordReset')

//email handler
const nodemailer = require("nodemailer")

//unique string
const {v4: uuidv4} = require("uuid")

//env variables
require('dotenv').config()


//password handler
const bcrypt = require('bcrypt')

//path for static verified page
const path = require("path");

//nodemailer stuff
let transpoter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

//testing success
transpoter.verify((error, success) => {
    if(error) {
        console.log(error)
    }else {
        console.log("Ready for messages")
        console.log(success)
    }
})

//sign up
router.post('/signup', (req, res) => {
    let {name,email,password,doB} = req.body
    name = name.trim()
    email = email.trim()
    password = password.trim()
    doB = doB.trim()
    console.log("hai")
    if(name == "" || email == "" || password == "" || doB == ""){
        res.json({
            status: "FAILED",
            message: "Empty input field!!!"
        })
    }
    else if(!/^[a-zA-Z ]*$/.test(name)){
        res.json({
            status: "FAILED",
            message: "Invalid name entered"
        })
    }
    else if(!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
        res.json({
            status: "FAILED",
            message: "Invalid Email entered"
        })
    }
    else if(!new Date(doB).getTime()){
        res.json({
            status: "FAILED",
            message: "Invalid date of birth entered"
        })
    }
    else if(password.length < 8){
        res.json({
            status: "FAILED",
            message: "Password is too short!!!"
        })
    }
    else{
        User.find({email}).then(result => {
            if(result.length){
                res.json({
                    status: "FAILED",
                    message: "User with the provided email already exists!!!"
                })
            }
            else{//try to create new user
                // password handling
                const saltRounds = 10
                bcrypt.hash(password, saltRounds).then(hashedPassword => {
                    const newUser = new User({
                        name,
                        email,
                        password: hashedPassword,
                        doB,
                        verified: false
                    })
                    newUser.save().then(result => {
                        // res.json({
                        //     status: "SUCCESS",
                        //     message: "Sign up successfull",
                        //     data: result,
                        // })
                        //handle account verfication
                        sendVerficationEmail(result, res);
                    })
                    .catch(err => {
                        res.json({
                            status: "FAILED",
                            message: "An error occurred while saving user account"
                        })
                    })
                })
            }
        }).catch(err => {
            console.log(err)
            res.json({
                status: "FAILED",
                message: "An error occurred while checking for existing user"
            })
        })
    }
});
console.log("hai")


//send verification email
const sendVerficationEmail = ({_id, email}, res) => {
    //url to be used in the email
    const currentUrl = "https://login-api-ybui.onrender.com/";
    // const currentUrl = "https://hjk-app.herokuapp.com/";

    const uniqueString = uuidv4() + _id;

    //mail optionsd
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Verify Your Email",
        html: `<p>Verify your email address to complete the signup and login into your account.</p><p>This link <b>expires in 6 hours</b>.</p><p>Press <a href=${currentUrl + "user/verify/" + _id + "/" + uniqueString}>here</a> to proceed.</p>`
    };
    //hash the uniqueString
    const saltRounds = 10;
    bcrypt
        .hash(uniqueString, saltRounds)
        .then((hashedUniqueString) => {
            //set values in userVerification collection
            const newVerification = new UserVerification({
                userId: _id,
                uniqueString: hashedUniqueString,
                createdAt:Date.now(),
                expiresAt: Date.now() + 21600000,
            });
            newVerification
                .save()
                .then(() => {
                    transpoter
                        .sendMail(mailOptions)
                        .then(() => {
                            //email sent and verification record saved
                            res.json({
                                status: "PENDING",
                                message: "Verification email sent"
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.json({
                                status: "FAILED",
                                message: "Verification email failed"
                            })
                        })
                })
                .catch((error) => {
                    console.log(error);
                    res.json({
                        status: "FAILED",
                        message: "Couldn't save verofication email data!",
                    })
                })
        })
        .catch(() => {
            res.json({
                status: "FAILED",
                message: "An error occurred while hashing email data!"
            })
        })
};

// verify email
router.get("/verify/:userId/:uniqueString", (req, res) => {
    let { userId, uniqueString } = req.params;

    UserVerification
        .find({userId})
        .then((result) => {
            if (result.length > 0) {
                //user verification record exists so we proceed
                const {expiresAt} = result[0];
                const hashedUniqueString = result[0].uniqueString;

                //checking for expired unique string
                if(expiresAt < Date.now()){
                    //record has expired so we delete it
                    UserVerification
                        .deleteOne({ userId })
                        .then(result => {
                            User
                                .deleteOne({_id: userId})
                                .then(()=> {
                                    let message = "Link has expired. please sign up again."
                                    res.redirect(`/user/verified/error=true&message=${message}`);
                                })
                                .catch((error) => {
                                    console.log(error);
                                    let message = "Clearing user with expired unique string failed"
                                    res.redirect(`/user/verified/error=true&message=${message}`);
                                })
                        })
                        .catch((error) => {
                            console.log(error);
                            let message = "An error occured while clearing expired user verification record"
                            res.redirect(`/user/verified/error=true&message=${message}`);
                        })
                } else {
                    //valid record exists so we validate the user string
                    // first compare the hased unique string
                    bcrypt
                        .compare(uniqueString, hashedUniqueString)
                        .then(result => {
                            if (result) {
                                //string match
                                User
                                    .updateOne({_id: userId}, {verified: true})
                                    .then(() => {
                                        UserVerification
                                            .deleteOne({userId})
                                            .then(() => {
                                                res.sendFile(path.join(__dirname, "./../views/verified.html"));
                                            })
                                            .catch(error => {
                                                console.log(error);
                                                let message = "An error occured while finalizing successful verification."
                                                res.redirect(`/user/verified/error=true&message=${message}`);
                                            })
                                    })
                                    .catch(error => {
                                        console.log(error);
                                        let message = "An error occured while updating user record to show verified."
                                        res.redirect(`/user/verified/error=true&message=${message}`);
                                    })
                            } else {
                                //existing record but incorrect verification details passed
                                let message = "Invaid verification details passed. Check your inbox."
                                res.redirect(`/user/verified/error=true&message=${message}`);
                            }
                        })
                        .catch(error => {
                            let message = "An error occured while comparing unique strings."
                            res.redirect(`/user/verified/error=true&message=${message}`);
                        })
                }
            } else {
                //user verification record doesn't exists
                let message = "Account record doesn't exist or has been verified already. please signin or log in."
                res.redirect(`/user/verified/error=true&message=${message}`); 
            }
        })
        .catch((error) => {
            console.log(error);
            let message = "An error occured while checking for existing user verification record"
            res.redirect(`/user/verified/error=true&message=${message}`);
        })
});

//Verified page route
router.get("/verified", (req, res) => {
    res.sendFile(path.join(__dirname, "./../views/verified.html"));
})


//signin
router.post('/signin', (req, res) => {
    let {email,password} = req.body
    email = email.trim()
    password = password.trim()

    if(email == "" || password == ""){
        res.json({
            status: "FAILED",
            message: "Empty credentials"
        })
    } 
    else{
        User.find({email})
        .then(data => {
            if(data.length){
                //user exists
                //check if user is verified
                if(!data[0].verified){
                    res.json({
                        status: "FAILED",
                        message: "Email hasn't been verified yet. Check your inbox.",
                        data: data
                    })
                } else {
                    const hashedPassword = data[0].password
                    bcrypt.compare(password, hashedPassword).then(result => {
                    if(result){
                        res.json({
                            status: "SUCCESS",
                            message: "Singin successfull",
                            data: data
                        })
                    }
                    else {
                        res.json({
                            status: "FAILED",
                            message: "invalid password entered"
                        })
                    }
                })
                .catch(err => {
                    console.log(err)
                    res.json({
                        status: "FAILED",
                        message: "An error occurred while comparing password"
                    })
                })
                }


                
            }
            else{                
                    res.json({
                        status: "FAILED",
                        message: "invalid username entered"
                    })                
            }
        })
        .catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occurred while checking for existing user"
            })
        })
    }


});

//Password reset stuff
router.post("/requestPasswordReset", (req, res) => {
    const {email, redirectUrl} = req.body;
    //check if email exists
    User
        .find({email})
        .then((data) => {
            if(data.length){
                //user exists

                //check if user is verified
                if(!data[0].verified) {
                    res.json({
                        status: "FAILED",
                        message: "Email hasn't been verified yet, Check your inbox"
                    });
                } else {
                    //proceed with email to reset password
                    sendResetEmail(data[0], redirectUrl, res);
                }

            } else {
                res.json({
                    status: "FAILED",
                    message: "No account with the supplied email exists!!"
                })
            }
        })
        .catch(error => {
            console.log(error);
            res.json({
                status: "FAILED",
                message: "An error occurred while checking for existing user"
            })
        })

})

//send password reset email
const sendResetEmail = ({_id, email}, redirectUrl, res) => {
    const resetString = uuidv4() + _id;

    //first, we clear all existing reset records
    PasswordReset
        .deleteMany({ userId: _id})
        .then(result => {
            //Reset records deleted successfully
            //npw we send the email

            //mail optionsd
            const mailOptions = {
                from: process.env.AUTH_EMAIL,
                to: email,
                subject: "Password Reset",
                html: `<p>We heard that you lost the password.</p><p>Don't worry, use the below link to reset it.</p><p>This link <b>expires in 60 minutes</b>.</p><p>Press <a href=${redirectUrl + "/" + _id + "/" + resetString}>here</a> to proceed.</p>`
            };
            
            //hash the rset string
            const saltRounds= 10;
            bcrypt
                .hash(resetString, saltRounds)
                .then(hashedResetString => {
                    //set values in password reset collection
                    const newPasswordReset = new PasswordReset({
                        userId: _id,
                        resetString: hashedResetString,
                        createdAt: Date.now(),
                        expiresAt: Date.now() + 3600000
                    });

                    newPasswordReset
                        .save()
                        .then(() => {
                            transpoter
                                .sendMail(mailOptions)
                                .then(() => {
                                    // reset email sent and password reset record saved
                                    res.json({
                                        status: "PENDING",
                                        message: "Password reset email sent"
                                    });
                                })
                                .catch(error => {
                                    console.log(error);
                                    res.json({
                                        status: "FAILED",
                                        message: "Password reset email failed"
                                    });
                                })
                        })
                        .catch(error => {
                            console.log(error);
                            res.json({
                                status: "FAILED",
                                message: "Couldn't save password reset data!"
                            });
                        })
                })
                .catch(error => {
                    console.log(error);
                    res.json({
                        status: "FAILED",
                        message: "An error occured while hashing the password reset data!"
                    });
                    
                })
        })
        .catch(error => {
            //error while clearing existing records
            console.log(error);
            res.json({
                status: "FAILED",
                message: "Clearing existing password reset records failed"
            });
        }) 
}

//Actually reset the password
router.post("/resetPassword", (req, res) => {
    let {userId, resetString, newPassword} = req.body;

    PasswordReset
        .find({userId})
        .then(result => {
            if(result.length > 0){
                //Password reset record exists so we proceed
                const {expiresAt} = result[0];
                const hashedResetString = result[0].resetString;
                //checking for expired reset string
                if (expiresAt < Date.now()){
                    PasswordReset
                        .deleteOne({userId})
                        .then(() => {
                            //Reset record deleted successfully
                            res.json({
                                status: "FAILED",
                                message: "Password reset link has expired."
                            })
                        })                        
                        .catch(error => {
                            //deletion failed
                            console.log(error);
                            res.json({
                                status: "FAILED",
                                message: "Clearing  password reset record failed."
                            });
                        })
                }else{
                    //valid reset exists so we validate the resset string
                    // first compare the hashed reset string
                    bcrypt
                        .compare(resetString, hashedResetString)
                        .then((result) => {
                            if(result){
                                //string matched
                                //hash password again
                                const saltRounds =10;
                                bcrypt
                                    .hash(newPassword, saltRounds)
                                    .then(hashedNewPassword => {
                                        //update user password
                                        User
                                            .updateOne({_id: userId}, {password: hashedNewPassword})
                                            .then(() => {
                                                //update complete. now delete reset record
                                                PasswordReset
                                                    .deleteOne({userId})
                                                    .then(() => {
                                                        //both user record and reset record updated
                                                        res.json({
                                                            status: "SUCCESS",
                                                            message: "Password has been reset successfully."
                                                        })
                                                    })
                                                    .catch(error => {
                                                        console.log(error);
                                                        res.json({
                                                            status: "FAILED",
                                                            message: "An error occured while finalizing password reset."
                                                        })
                                                    })
                                            })
                                            .catch(error => {
                                                console.log(error);
                                                res.json({
                                                    status: "FAILED",
                                                    message: "Updating user password failed."
                                                })
                                            })
                                    })
                                    .catch(error => {
                                        console.log(error);
                                        res.json({
                                            status: "FAILED",
                                            message: "An error occured while hashing new password."
                                        })
                                    })
                            } else {
                                //Existing record but incorrect reset string passed.
                                res.json({
                                    status: "FAILED",
                                    message: "Invalid password reset details passed."
                                })
                            }
                        })
                        .catch(error => {
                            res.json({
                                status: "FAILED",
                                message: "Comparing password reset string failed."
                            })
                        })
                }

            }else {
                //password reset record doesn't exist
                res.json({
                    status: "FAILED",
                    message: "Password reset request not found."
                });
            }
        })
        .catch(error => {
            console.log(error);
            res.json({
                status: "FAILED",
                message: "Checking for existing password reset failed."
            });
        })
})

router.post('/bmi', (req, res) => {
    let {userId,height,weight} = req.body
    userId = userId.trim
    height = 165
    weight = 65
    const newUser = new User({
        height,
        weight
    })
    newUser.save().then(result => {
        res.json({
            status: "SUCCESS",
            message: "Sign up successfull",
            data: result,
        })
})
});

// router.post('/bmi', (req, res) => {
    
// })


module.exports = router