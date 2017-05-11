const userSchema = require('../../auth/models/user');
const PassportLocalStrategy = require('passport-local').Strategy;

module.exports = new PassportLocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    session: false,
    passReqToCallback: true
}, (req, username, password, done) => {

    const userData = {
        firstname: req.body.firstname.trim(),
        lastname: req.body.lastname.trim(),
        email: req.body.email.trim(),
        username: username.trim(),
        password: password.trim()

    };

    var db = mongoose.createConnection(config.xplorifyDb, { auth: { authdb: "admin" } });
    var userModel = db.model("users", userSchema);

    const newUser = new userModel(userData);
    newUser.save((err) => {
            if (err) {
                return done(err);
            }
            return done(null);
        })
        .finally(function() {
            db.close();
        });
});