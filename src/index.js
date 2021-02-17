const express = require('express')
const app = express()
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const AppointmentService = require("./services/AppointmentService")

app.use(express.static(__dirname + 'public'));

//config
app.use(express.static("public"))

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.set('view engine', 'ejs')

//conexão padrão
mongoose.connect("mongodb://localhost:27017/agendamento",{useNewUrlParser: true, useUnifiedTopology: true})



app.get("/", async (req, res) => {
    
    var appos = await AppointmentService.GetAll(true)
    res.render("index", {appos})
    
})

app.get("/register", (req, res) => {
    res.render("create")
})



 app.post("/create", async (req, res) => {
 var status = await AppointmentService.Create(
        req.body.name,
        req.body.email,
        req.body.description,
        req.body.cpf,
        req.body.date,
        req.body.time,
    )

    if(status){
        res.redirect("/")
    }else{
        res.send("Ocorreu uma falha!")
    }
})

app.get("/getcalendar", async (req, res) => {
    //dados da consulta
    var appointments =  await AppointmentService.GetAll(false)
    res.json(appointments)
    

})


app.get("/event/:id", async (req, res) => {
  var appointment = await AppointmentService.GetById(req.params.id)
  console.log(appointment)
  res.render("event", {appo: appointment})
})

app.post("/finish", async (req, res) => {
    var id = req.body.id 
    await AppointmentService.Finish(id)
    res.redirect("/")
})

app.get("/list", async (req, res) => {

    // await AppointmentService.Search("342.342.34")

    var appos = await AppointmentService.GetAll(true)
    res.render("list", {appos})
  
   
})

app.get("/searchresult", async (req, res) => {
    var appos = await AppointmentService.Search(req.query.search)
    res.render("index", {appos})
 
})

// 1000 * 60 * 5  5 minutos
var pollTime = 1000 * 60 * 1
setInterval(async () => {

await AppointmentService.SendNotification()
    
}, pollTime)

app.listen(8080, ()=> {
    console.log("servidor rodando")
})