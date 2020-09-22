var https = require('https');
var qs = require("querystring");
module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('messages').find().toArray((err, result) => {
          if (err) return console.log(err)

//I will make my search queries to Groupon kinda like this, when they send me an APIKey//
            // https.get(`https://Groupon`, (resp) => {
            //   let data = '';
            //   resp.on('data', (obj) => {
            //     data += obj;
            //   });
            //   resp.on('end', () => {
            //     console.log('')
            //         console.log('This is all the Groupon data as an object that I will render to the client',JSON.parse(data))
            //   });
            // }).on("error", (err) => {
            //   console.log("Error: " + err.message);
            // });

//Around here I will make my search queries to FourSquare//
            https.get(`https://api.foursquare.com/v2/venues/search?client_id=CRK3M3QSQ4SSNTAJ34HBSHLYURAPOYHYQ0PVJHKTSNCPIYC2&client_secret=ZRZQNU3GQY3FXA4L2ASD5G03AF0RS34CAATEIMBJHJZWLJUZ&ll=40.74224,-73.99386&v=20200901`, (resp) => {
              let data = '';
              resp.on('data', (obj) => {
                data += obj;
              });
              resp.on('end', () => {
                console.log('')
                    console.log('This is all the FourSquare data as an object that I will render to the client',JSON.parse(data))
              });
            }).on("error", (err) => {
              console.log("Error: " + err.message);
            });

  //I Couldnt get the AIRBNB query to work Server side because Airbnb doesnt provide access unless through third party//
  //In This case I'm using Rapid API. I might have to keep this query client side if I can't find an alternative//

    //Around Here I will make my search queries to AirBnB//
//   var options = {
//   	"method": "GET",
//   	"hostname": "https://mashvisor-api.p.rapidapi.com",
//   	"port": 8080,
//   	"path": '/airbnb-property/top-reviewed',
//   	"headers": {
//   		"x-rapidapi-key": "3ae1d00c97msh298612aebb81230p11684djsn405007844583",
//   		"content-type": "application/x-www-form-urlencoded",
//   		"useQueryString": 'page=1&city=Los%20Angeles&reviews_count=30&zip_code=91342&state=CA'
//   	}
//   };
//
// https.get(options, function (respo) {
//   	var chunks = '';
//
//   	respo.on("data", function (chunk) {
//   		chunks+=chuck;
//   	});
// console.log(chunks)
//   	respo.on("end", function () {
//       console.log(chunks)
//   		var body = Buffer.concat(chunks);
//   		console.log(body.toString());
//   	});
//   }).on("error", (err) => {
//     console.log("Error: " + err.message);
//   });

          res.render('profile.ejs', {
            user : req.user,
            messages: result
          })
        })
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// message board routes ===============================================================

    app.post('/messages', (req, res) => {
      db.collection('messages').save({name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown:0}, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/profile')
      })
    })

    app.put('/messages', (req, res) => {
      db.collection('messages')
      .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
        $set: {
          thumbUp:req.body.thumbUp + 1
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    app.put('/nomessages', (req, res) => {
      db.collection('messages')
      .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
        $set: {
          thumbUp:!req.body.thumbUp?0:req.body.thumbUp-1
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    app.delete('/messages', (req, res) => {
      db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
