var appointment = require("../models/Appointment")
var mongoose = require("mongoose")
var AppointmentFactory = require("../factories/AppointmentFactory")
var mailer = require("nodemailer")


//  node da coleção / model
const Appo = mongoose.model("Appointment", appointment)


class AppointmentService {

    async Create(name, email, description, cpf, date, time){
        var newAppo = new Appo({
            name,
            email,
            description,
            cpf,
            date,
            time,
            finished: false,
            notified: false
        })
        try{
            await newAppo.save()
            return true
        }catch(err){
            console.log(err)
            return false
        }
       
    }
    
    async GetAll(showFinished){

       
        if(showFinished){
            return await Appo.find()
        }else{
            var appos = await Appo.find({'finished': false})
            var appointments = []

            appos.forEach(appointment => {

                appointments.push(AppointmentFactory.Build(appointment))
            })
            
            return appointments
        }

    }

    async GetById(id){

        try{
            var event = await Appo.findOne({'_id': id})
            return event
        }catch(err){
            console.log('Erro ao pegar o id do usuário '+ err)
        }

    }

    async Finish(id){
        try{
            await Appo.findByIdAndRemove(id,{finished: true})
            return true
        }catch(err){
            console.log(err)
            return false
        }

       
    }

   
    // email@email.com or 123.456.789-00 
    async Search(query){
        try{
            var appos = await Appo.find().or([{email: query},{cpf: query}])
            return appos
        }catch(err){
            console.log(err)
            return []
        }
    }


    async SendNotification(){
      var appos = await this.GetAll(false)

      var transporter = mailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 25,
        auth: {
            user: "c2ed244e5b1900",
            pass: "8b07790780ed75"
        }
    })

      appos.forEach(async app => {
          
        //data no formato de mili-seg
        var date = app.start.getTime()
        var hour = 1000 * 60 * 60 
        var gap = date-Date.now()

        if(gap <= hour){
          
            if(!app.notified){

               await Appo.findOneAndUpdate(app.id,{notified: true})

                transporter.sendMail({
                    from: "Cesar Augusto <cesar@curso.com>",
                    to: app.email,
                    subject: "Sua consulta vai acontecer em breve!",
                    text: "Sua consulta vai acontecer em 1hr!"
                }).then(() => {
                    console.log("Deu tudo certo!")
                }).catch(err => {
                    console.log(err)
                })

            }

        }

      })
    
    }



}


module.exports = new AppointmentService

