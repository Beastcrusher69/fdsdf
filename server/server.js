require('dotenv').config();
const express = require('express') ;
const cookieParser = require('cookie-parser') ;
const jwt = require('jsonwebtoken') ;
const app = express() ;
const cors = require('cors') ;
const mongoose = require('mongoose') ;
const mongoUri = process.env.MONGO_URI ;
const port = 4000 ;

const corsOptions = {
    // origin : "http://localhost:5173",
    origin : "https://hack-the-spring-med-tech.vercel.app",
    credentials : true,
    optionSuccessStatus : 200 
}

app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

function AuthenticateToken(req,res,next){

    let token = req.cookies.authToken ;

    if(!token){
        res.sendStatus(401);
        return;
    }
    else{

        try{
            let payload = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET);

            req.payload = payload;

            next();

            return;

        }
        catch{
            res.sendStatus(498);

            return;
        }
    }

}

mongoose.connect(mongoUri ,{ useNewUrlParser : true , useUnifiedTopology : true})
        .then(console.log("connected to database"))
        .catch((err)=>{console.log("mongoose connection error :" ,err)});


const UserSchema = mongoose.Schema({
    firstName : String ,
    lastName : String ,
    emailId : String ,
    phoneNo : Number ,
    password : String ,
    role : String 
})

const PatientSchema = mongoose.Schema({
     emailId : String , 
     address : String,
     city : String ,
     state : String ,
     birthdate : String ,
     age : Number ,
     gender : String,
     occupation : String,
     previousMedicalHistory : String,
     previousMedicalHistoryImageURLs : [String]
    })

const DoctorSchema = mongoose.Schema({
    emailId : String , 
    address : String,
    city : String ,
    state : String ,
    birthdate : String ,
    age : Number ,
    gender : String,
    education : String,
    personalID : String,
   })

const Users = mongoose.model("Users" , UserSchema) ;
const Patients = mongoose.model("Patients" , PatientSchema) ;
const Doctors = mongoose.model("Doctors" , DoctorSchema) ;

app.get("/home" , (req , res)=>{
    res.json({
        "user1" : "jay k" ,
        "user2" : "hdshf fwef" ,
        "user3" : "wefw efwew" 
    })
}) 

app.post("/signup" , async (req , res)=>{

    let {firstName , lastName , emailId , phoneNumber, password , role } = req.body ;

    let user = await Users.findOne({emailId});
    let payload = { emailId };

    if(user){

        res.send({code : 1 , message : "email is already taken"});

        return ;
    }

    firstName = firstName.slice(0,1).toUpperCase() + firstName.slice(1);
    lastName = lastName.slice(0,1).toUpperCase() + lastName.slice(1);

    let userData = {firstName , lastName , emailId , phoneNumber , password , role } ;

    Users.create(userData) ; 

    let token = jwt.sign( payload , process.env.ACCESS_TOKEN_SECRET  ); 

    res.cookie("authToken" , token ,{ httpOnly : true , sameSite : "none" , secure : true})

    res.json({code : 2 , "user" : { firstName , lastName}});    
})

// app.post("/login") ;

app.get("/choose-role" ,
 AuthenticateToken ,
(req , res)=>{
    res.json({code : 2 , message : "valid user"});
})

app.get("/submit-medical-history" ,
 AuthenticateToken ,
(req , res)=>{
    res.json({code : 2 , message : "valid user"});
})

app.post("/submit-medical-history" , AuthenticateToken ,async (req , res)=>{

    let emailId = req.payload.emailId ;

    let user = await Users.findOne({emailId});
    
    user.role = "patient" ;

    user.save() ;

    let data = req.body ;
    console.log("data >>> " ,data) ;

    let PatientData = {emailId ,...data } ;

    console.log("patient data >>> " ,PatientData) ;
    Patients.create(PatientData) ;

    res.json({code : 2 , message : "data saved successfully"});
})

app.post("/submit-doctor-details" , AuthenticateToken ,async (req , res)=>{

    let emailId = req.payload.emailId ;

    let user = await Users.findOne({emailId});
    
    user.role = "doctor" ;

    user.save() ;

    let data = req.body ;
    console.log("data >>> " ,data) ;

    let DoctorData = {emailId ,...data } ;

    console.log("doctor data >>> " , DoctorData) ;
    Doctors.create(DoctorData) ;

    res.json({code : 2 , message : "data saved successfully"});
})

// app.get("/select-patient" , AuthenticateToken, async (req , res)=>{

//     let emailId = req.payload.emailId ;

//     // console.log(payload) ;

//     let user = await Users.findOne({emailId})

//     user.role = "patient" ;

//     await user.save() ;

//     res.json({ code : 2 , message : "role set to patient"}) ;
// })

app.listen(port  , ()=>{
    console.log("listening on port :", port);
})
