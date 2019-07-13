//Import Package
const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const nodemailer = require('nodemailer');



const config = require('./config');

//Set Package
const app = express();

app.use(express.static('public/1'));


app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Server Start Notification
const port = process.env.PORT || 4005;
app.listen(port, () => console.log("Server Started..."));



//Set Static Folder Path
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public/1')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/', express.static(path.join(__dirname, '/')));

//Get Index Page Request
app.get ('/', (req, res) => {
res.sendFile('public/1/index.html', { root: __dirname });
});

app.get ('/gift', (req, res) => {
    res.render(
    config.theme);
});

app.get ('/gift', (req, res) => {
    res.render({scripts: ['/public/jquery-3.3.1.min.js', '/public/jquery-3.3.1.js','/public/bootstrap-datetimepicker.min.js','/public/1.js',]
  }

  );
});

app.get ('/offer', (req, res) => {
    res.render(config.theme);
});


//Post Emaul Request
app.post('/send', (req, res) => {

    //Email Template
    const output = `
        <p>You have a message</p>
        <h3>Contact Details of: ${req.body.name}</h3>
        <p>Name: ${req.body.name}</p>
        <p>Contact No: ${req.body.contact_no} </p>
        <p>Email: ${req.body.email} </p>
        <p>Secret Code: ${req.body.secretcode}</p>
        <p>Appoinment Date: ${req.body.appoinmentDate}</p>
        <p>Wedding Date: ${req.body.WedDate}</p>
        <p>Hotel Details:${req.body.hotelDetails}</p>


    `;

    //Alert if success sending email
    const successAlert = `
        <div class="uk-alert-success" uk-alert>
                <a class="uk-alert-close" uk-close></a>
                <p>You secret code has been sent successfully!!</p>
        </div>
    `;

    //Alert if fail sending email
    const failAlert = `
        <div class="uk-alert-warning" uk-alert>
                <a class="uk-alert-close" uk-close></a>
                <p>Failed to send the secret code. Please refresh this page or try again</p>
        </div>
    `;


    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
            host:  config.host,
            port: config.port,
            secure: false,
            auth: {
                    user: config.user,
                    pass: config.pass
            },
            tls:{
                rejectUnauthorized:false
            }
    });

    // setup email data with unicode symbols
    let mailOptions = {
            from: config.from,
            to: config.to,
            subject: config.subject,
            html: output
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                    res.render(config.theme, {msg: failAlert});
            }

            res.render(config.theme, {msg: successAlert});
    });
});
