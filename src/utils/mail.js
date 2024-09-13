import nodemailer from 'nodemailer';

// Configurar el servicio de correo electrónico
let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {                
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls : { rejectUnauthorized: false },
    connectionTimeout: 10000 
}); 

export const sendMessage = async (alarm, variables, email) => {

    let mailOptions = {
        from: 'info@ruscica-code.ar',
        to: email,
        subject: `Alarma ${alarm.disparada == 1 ? 'disparada' : 'reseteada'} - ${alarm.nombre} - MDV Sensores`,
        html: ` <div style="font-size: 1rem">
                    <h1 style="color: ${alarm.disparada == 1 ? 'red' : 'green'};">Alarma ${alarm.disparada == 1 ? 'disparada' : 'reseteada'}</h1>
                    <p >Se registro un cambio en la alarma <strong>'${alarm.nombre}</strong>.'</p>
                    <p>La condicion de disparo es <strong>${alarm.condicion}</strong>\
                    y el valor registrado fue ${variables.porcentaje_encendido}</p>
                    <p>El periodo de tiempo para promediar es de\
                    ${alarm.periodo_tiempo < 60 ? alarm.periodo_tiempo + ' minutos.' : alarm.periodo_tiempo / 60 + " horas"} para atras</p>
                    <p>Enlace para marcar la alarma como vista: EN PROCESO</p>
                    <p>MDVsrl 2024.</p>
                </div>
                `
        };  

    const results = await transporter.sendMail(mailOptions);        
        if (results.rejected.length == 0){
            //console.log('Correo enviado correctamente!');
            return true;
        }else{
            return false;
        }

}