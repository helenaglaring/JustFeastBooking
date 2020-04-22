/*---------------------------------------------Logout page call ------------------------------------------------------*/
// GET route for user logout
// Sletter også session

module.exports = (req,res) => {
    res.clearCookie("jwt-token");
    req.flash('success', "Logged out. See you soon!");
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        console.log("Bruger er logget ud");
        res.redirect('login');
    });
};