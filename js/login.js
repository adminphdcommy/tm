let redirect = true
let step = util.url.get("step") || 1
let currentUser = {}
let mayNeedLinkPassword = false
if (window.localStorage) {
    let m = window.localStorage.getItem("mayNeedLinkPassword")
    if (m == "true") {
        mayNeedLinkPassword = true
        redirect = false
    }
}
firebase.auth().onAuthStateChanged(function (user) {
    util.overlay(true).desc("Authenticating")
    if (user) {
        // util.overlay(true).desc("Authenticating")
        currentUser = user
        if (redirect) {
            location.href = "/"
        } else {
            $(".step3").show()
            $(".step2").hide()
            $(".step1").hide()
            util.overlay(false)
        }
    } else {
        util.overlay(false)
    }
});

if (step == 1) {
    $(".login-wrapper .step1").show()
    $(".login-wrapper .step2").hide()

} else if (step == 2) {
    $(".login-wrapper .step2").show()
    $(".login-wrapper .step1").hide()

}


function checkEmailSigninMethod() {
    let email = $("#email").val()
    if (!email) {
        return alert("email  is missing")
    }
    util.overlay(true).desc("Checking Email")
    $("#checkEmailBtn").hide()
    firebase.auth().fetchSignInMethodsForEmail(email).then((signInMethods) => {
        // This returns the same array as fetchProvidersForEmail but for email
        // provider identified by 'password' string, signInMethods would contain 2
        // different strings:
        // 'emailLink' if the user previously signed in with an email/link
        // 'password' if the user has a password.
        // A user could have both.
        if (signInMethods.indexOf(
            firebase.auth.EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD) != -1) {
            // User can sign in with email/password.
            loginWithPasswordHandler()
        } else if (signInMethods.indexOf(
            firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD) != -1) {
            // User can sign in with email/link.
            loginWithLinkHandler()
        } else {
            loginWithLinkHandler()
        }
    }).catch((error) => {
        // Some error occurred, you can inspect the code: error.code
        var errorCode = error.code;
        var errorMessage = error.message;
        $(".alert-success").hide()
        $(".alert-danger").show()
        $(".alert-danger h5").html(errorCode)
        $(".alert-danger p").html(errorMessage)
    }).finally(() => {
        util.overlay(false)
    });

}




$("#notReceiveEmail").on("click", notReceiveEmailHandler)


function notReceiveEmailHandler(e) {
    $(".form-group.password").show()
    $("#emailHelp").hide()
    $("#notReceiveEmail").hide()
    $("#signupBtn").show()
    $("#sendVerificationBtn").hide()
}

$("#loginWithPassword").on("click", loginWithPasswordHandler)

function loginWithPasswordHandler(e) {
    $(".form-group.password").show()
    $("#emailHelp").hide()
    $("#passwordHelp").hide()
    $("#signupBtn").hide()
    $("#notReceiveEmail").hide()
    $("#loginWithPassword").hide()
    $("#loginBtn").show()
    $("#sendVerificationBtn").hide()
    $("#loginWithLink").show()

}

$("#loginWithLink").on("click", loginWithLinkHandler)

function loginWithLinkHandler(e) {
    $(".form-group.password").hide()
    $("#emailHelp").show()
    $("#passwordHelp").hide()
    $("#signupBtn").hide()
    $("#notReceiveEmail").hide()
    // $("#loginWithPassword").show()
    $("#loginWithLink").hide()
    $("#loginBtn").hide()
    $("#sendVerificationBtn").show()

}

$("#signupBtn").on("click", signupHandler)

function signupHandler(e) {
    util.overlay(true).desc("Signing up user")

    let email = $("#email").val() || currentUser.email
    let password = $("#password2").val() || $("#password").val()
    if (!email || !password) {
        return alert("email or password is missing")
    }

    firebase.auth().createUserWithEmailAndPassword(email, password).then((userCredential) => {
        window.localStorage.removeItem('mayNeedLinkPassword');
        redirect = true
        // Signed in 
        var user = userCredential.user;
        // ...
    }).catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode == "auth/email-already-in-use") {
            $(".alert-success").hide()
            $(".alert-danger").show()
            $(".alert-danger h5").html("Email already in use")
            $(".alert-danger p").html("You must have either created account or login with Email Link before. You may need to <a href='#' onclick='resetPassword()'>reset password</a> or <a href='#' onclick='loginWithLinkHandler()'>login with Email Link again</a>.")
            window.localStorage.setItem('mayNeedLinkPassword', true);

        } else {
            $(".alert-success").hide()
            $(".alert-danger").show()
            $(".alert-danger h5").html(errorCode)
            $(".alert-danger p").html(errorMessage)
        }

        // ..
    }).finally(() => {
        util.overlay(false)
    });
}

function resetPassword() {
    util.overlay(true).desc("Sending reset password email")

    let email = $("#email").val() || currentUser.email
    firebase.auth().sendPasswordResetEmail(email).then(() => {
        // Password reset email sent!
        // ..
        $(".alert-danger").hide()
        $(".alert-success").show()
        $(".alert-success h5").html("Reste Password Email Sent")
        $(".alert-success p").html(`A verification email has been sent to ${email}. Please click the link from the email to continue.`)

    }).catch((error) => {
        console.log(error)
        var errorCode = error.code;
        var errorMessage = error.message;
        $(".alert-success").hide()
        $(".alert-danger").show()
        $(".alert-danger h5").html(errorCode)
        $(".alert-danger p").html(errorMessage)
        // ..
    }).finally(() => {
        util.overlay(false)
    });
}

$("#loginBtn").on("click", loginHandler)

function loginHandler(e) {
    util.overlay(true).desc("Logging in")

    let email = $("#email").val()
    let password = $("#password").val()
    if (!email || !password) {
        return alert("email or password is missing")
    }
    firebase.auth().signInWithEmailAndPassword(email, password).then((userCredential) => {
        // Signed in
        var user = userCredential.user;
        redirect = true
        // ...
    }).catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        $(".alert-success").hide()
        $(".alert-danger").show()
        $(".alert-danger h5").html(errorCode)
        $(".alert-danger p").html(errorMessage)
    }).finally(() => {
        util.overlay(false)
    });

}



function sendVerificationEmail() {
    util.overlay(true).desc("Sending Verification Email")

    var actionCodeSettings = {
        // URL you want to redirect back to. The domain (www.example.com) for this
        // URL must be in the authorized domains list in the Firebase Console.
        url: `${location.origin}${location.pathname}?step=2`,
        // This must be true.
        handleCodeInApp: true
    };
    let email = $("#email").val()
    if (!email) {
        return alert("email is missing")
    }
    firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings).then(async () => {
        // The link was successfully sent. Inform the user.
        // Save the email locally so you don't need to ask the user for it again
        // if they open the link on the same device.
        window.localStorage.setItem('emailForSignIn', email);
        $(".alert-danger").hide()
        $(".alert-success").show()
        $(".alert-success h5").html("Email Sent")
        $(".alert-success p").html(`A verification email has been sent to ${email}. Please click the link from the email to continue.`)
        $("#sendVerificationBtn").prop("disabled", true)
        for (let i = 0; i < 5; i++) {
            $("#sendVerificationBtn").html(`Resend Email Link in (${5 - i})`)
            await wait(1000)
        }
        $("#sendVerificationBtn").html(`Resend verification email`)
        $("#notReceiveEmail").show()
        $("#sendVerificationBtn").prop("disabled", false)
        // $(".login-wrapper .step2").show()
        // $(".login-wrapper .step1").hide()
        // window.history.pushState({}, document.title, "/" + "login?step=2");

        // ...
    }).catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        $(".alert-success").hide()
        $(".alert-danger").show()
        $(".alert-danger h5").html(errorCode)
        $(".alert-danger p").html(errorMessage)

        // ...
    }).finally(() => {
        util.overlay(false)
    })
}

function verifyNow() {
    util.overlay(true).desc("Verifiying")

    if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
        // Additional state parameters can also be passed via URL.
        // This can be used to continue the user's intended action before triggering
        // the sign-in operation.
        // Get the email if available. This should be available if the user completes
        // the flow on the same device where they started it.
        var email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
            // User opened the link on a different device. To prevent session fixation
            // attacks, ask the user to provide the associated email again. For example:
            email = window.prompt('Please provide your email for confirmation');
        }

        firebase.auth().fetchSignInMethodsForEmail(email).then((signInMethods) => {
            // This returns the same array as fetchProvidersForEmail but for email
            // provider identified by 'password' string, signInMethods would contain 2
            // different strings:
            // 'emailLink' if the user previously signed in with an email/link
            // 'password' if the user has a password.
            // A user could have both.
            if (signInMethods.indexOf(
                firebase.auth.EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD) != -1) {
                // User can sign in with email/password.
                redirect = true
            } else if (signInMethods.indexOf(
                firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD) != -1) {
                // User can sign in with email/link.
                redirect = false
            } else {
                redirect = false
            }
            firebase.auth().signInWithEmailLink(email, window.location.href).then((result) => {
                // Clear email from storage.
                window.localStorage.removeItem('emailForSignIn');
                // You can access the new user via result.user
                // Additional user info profile not available via:
                // result.additionalUserInfo.profile == null
                // You can check if the user is new or existing:
                // result.additionalUserInfo.isNewUser


            }).catch((error) => {
                console.log(error)
                var errorCode = error.code;
                var errorMessage = error.message;

                // Some error occurred, you can inspect the code: error.code
                // Common errors could be invalid email and invalid or expired OTPs.
                $(".alert-success").hide()
                $(".alert-danger").show()
                $(".alert-danger h5").html(errorCode)
                $(".alert-danger p").html(errorMessage)

            }).finally(() => {
                util.overlay(false)
            });
        }).catch((error) => {
            // Some error occurred, you can inspect the code: error.code
            var errorCode = error.code;
            var errorMessage = error.message;
            $(".alert-success").hide()
            $(".alert-danger").show()
            $(".alert-danger h5").html(errorCode)
            $(".alert-danger p").html(errorMessage)
        }).finally(() => {
            util.overlay(false)
        });
        // The client SDK will parse the code from the link for you.

    } else {
        $(".alert-success").hide()
        $(".alert-danger").show()
        $(".alert-danger h5").html("Unable to verify")
        $(".alert-danger p").html("If you are using different device to receive email, please copy the verification url to this browser and enter.")
    }
}

function createPassword() {
    util.overlay(true).desc("Creating password")

    let password = $("#password2").val()
    if(!password){
        return alert("password is missing")
    }
    currentUser.updatePassword(password).then(() => {
        window.localStorage.removeItem('mayNeedLinkPassword');
        window.location.href = "/"
    }).catch((error) => {
        // An error ocurred
        // ...
        var errorCode = error.code;
        var errorMessage = error.message;
        $(".alert-success").hide()
        $(".alert-danger").show()
        $(".alert-danger h5").html(errorCode)
        $(".alert-danger p").html(errorMessage)
    }).finally(() => {
        util.overlay(false)
    });;

}

function skipPassword() {
    window.localStorage.removeItem('mayNeedLinkPassword');
    window.location.href = "/"
}


function wait(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    })
}