
import nodemailer from 'nodemailer';

// Configurar el servicio de correo electrónico
let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {                
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
}); 

export const sendMessage = async (alarm, variables, email) => {

    let emailContent = null;
    switch (alarm.tipo_alarma) {
        case "PORCENTAJE_ENCENDIDO":
            emailContent = `
                <div style="font-size: 1rem">
                    <h1 style="color: ${alarm.disparada == 1 ? 'red' : 'green'};">Alarma ${alarm.disparada == 1 ? 'disparada' : 'reseteada'}</h1>
                    <p >Se registro un cambio en la alarma <strong>'${alarm.nombre}</strong>.'</p>
                    <p>La condicion de disparo es <strong>${alarm.condicion}</strong> y el valor registrado fue ${variables.porcentaje_encendido}</p>
                    <p>El periodo de tiempo para promediar es de\
                        ${alarm.periodo_tiempo < 60 ? alarm.periodo_tiempo + ' minutos.' : alarm.periodo_tiempo / 60 + " horas"} para atras</p>
                    <p>Enlace para marcar la alarma como vista: EN PROCESO</p>
                    <p style="color: DodgerBlue"><strong>MDV SRL</strong> 2024 ©</p>
                </div>
                `;            
        break;
        case "FALLO_COMUNICACION":
            emailContent = `
                <div style="font-size: 1rem">
                    <h1 style="color: ${alarm.disparada == 1 ? 'red' : 'green'};">Alarma ${alarm.disparada == 1 ? 'disparada' : 'reseteada'}</h1>
                    <p >Se registro un cambio en la alarma <strong>'${alarm.nombre}</strong>.'</p>
                    <p>Los últimos datos recibidos desde el datalogger fueron hace ${variables.minutos_sin_conexion} minutos .</p>                    
                    <p>Enlace para marcar la alarma como vista: EN PROCESO</p>
                    <p style="color: DodgerBlue"><strong>MDV SRL</strong> 2024 ©</p>
                </div>
                `;            
        break;
    
        default:
            break;
    } 
    

    let mailOptions = {
        from: 'admin@impulsainternet.com',
        to: email,
        subject: `Alarma ${alarm.disparada == 1 ? 'disparada' : 'reseteada'} - ${alarm.nombre} - MDV Sensores`,
        html: emailContent
        };  

    const results = await transporter.sendMail(mailOptions);        
        if (results.rejected.length == 0){
            //console.log('Correo enviado correctamente!');
            return true;
        }else{
            return false;
        }

}

export const testMessage = async (text, email) => {
    let mailOptions = {
        from: 'admin@impulsainternet.com',
        to: email,
        subject: `testing hostinger with nodemailer`,
        html: text
        };  

        const results = await transporter.sendMail(mailOptions);        
        if (results.rejected.length == 0){
            console.log('Correo enviado correctamente!');
            return true;
        }else{
            return false;
        }
}