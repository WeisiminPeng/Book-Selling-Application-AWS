const logger = require('./app/config/winston.config.js');
const publicIp = require('public-ip');
const cors = require('cors');

(async () => {
  console.log("config public ip: "+ await publicIp.v4());
  process.env.IP = await publicIp.v4();
})();


let express = require("express"),
    bodyParser = require("body-parser"),
    app = express(),
    cookieParser = require("cookie-parser"),
    // set port
    PORT = process.env.PORT || 3000;


//Adding body parser for handling request and response objects.
// application/json
// app.use(cors());
// app.options('*', cors());
// app.use(cors({credentials: true, origin: ["http://prod.weisiminpeng.com", "http://prod.weisiminpeng.com:3000"], allowedHeaders: 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild', methods: 'GET, POST, OPTIONS, PUT, DELETE'}));
// app.options('*', cors({credentials: true, origin: ["http://prod.weisiminpeng.com", "http://prod.weisiminpeng.com:3000"], allowedHeaders: 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild', methods: 'GET, POST, OPTIONS, PUT, DELETE'}));
app.use(bodyParser.json());
// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//Enabling CORS


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    // res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});




let initApp = require('./app/app');
initApp(app);

app.listen(PORT);
console.log('webapp server started on: ' + PORT);
logger.info(`${new Date().toISOString()} message: webapp server started on: ${PORT}`);


// test route
app.delete("/users/:useremail", (req, res) => {
  res.send("logout webapp!");
  // res.json({ message: "webapp server test!" });
});

