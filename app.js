// jshint esversion: 6 

// requirements
const exp = require("constants");
const { response } = require("express");
const express = require("express");
const https = require("https");

// app declare and extras to read from a post request and use static files
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));


// MAIN

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/html/signup.html");
});

app.post('/', (req, res) => {
    const fname = req.body.fname;
    const lname = req.body.lname;
    const mail = req.body.mail;

    // API Documentation - MailChimp
    // https://mailchimp.com/developer/marketing/api/lists/batch-subscribe-or-unsubscribe/

    // members is an array of objects (max 500 at a time, but we will just add one person to the list at a time)
    // so make an array of a single object of a person
    const data = {
        members: [
            // array
            {
                // object
                email_address: mail,
                status: "subscribed",
                merge_fields: {
                    FNAME: fname,
                    LNAME: lname
                }
            }
        ]
    };

    // stringify the json data object we just created
    const jsonData = JSON.stringify(data);

    // make a send request to mail chimp (not same as get request)
    const api_key = `#api#`;
    const server = `us5`
    const list_id = `8fbaa62d02`
    const url = `https://${server}.api.mailchimp.com/3.0/lists/${list_id}`; // got all these from mail chimp

    // options for https request
    const options = {
        method: "POST",
        auth: "jaindivij_:#api#"
    }

    // to send the jsonData, according to the https (nodeJS) documentation, we need to save the https req in a const
    const request = https.request(url, options, (response) => {
        // check the status of response and accordingly redirect to success or failure htmls.
        if (response.statusCode === 200) {
            res.redirect("/success");
        } else {
            res.redirect("/failure");
        }


        // store any data (response) that we get back after the post request (also parse it through JSON)
        // Note: on printing response, we get info about the response like status_code etc, response.on() however gives us the *data* 
        // that was sent back as the response of the post/get request.
        response.on("data", (d) => {
            const returnedData = JSON.parse(d);
            console.log(returnedData);
        });
    });

    // send the form data (jsonData) through post (send) requent using the const variable made above
    request.write(jsonData);
    request.end(); // request ended
});

app.get('/success', (req, res) => {
    res.sendFile(__dirname + "/html/success.html");
});

app.get('/failure', (req, res) => {
    res.sendFile(__dirname + "/html/failure.html");
});

app.post('/failure', (req, res) => {
    res.redirect("/");
});

// listening to port 3000
app.listen(process.env.PORT || 3000, () => {
    console.log("Server Started!");
});