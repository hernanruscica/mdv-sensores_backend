//import { subset } from 'mathjs';

import nodemailer from 'nodemailer';

// Configurar el servicio de correo electrónico
let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {                
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        // No rechazar certificados autofirmados
        rejectUnauthorized: false
    }
}); 

export const sendMessage = async (alarm, mensaje, email, token) => {
    const baseURL = process.env.BASE_URL_FRONT;
    let emailContent = `
        <div style="font-size: 1rem">
            <h1 style="color: ${alarm.disparada == 1 ? 'red' : 'green'};">Alarma ${alarm.disparada == 1 ? 'disparada' : 'reseteada'}</h1>
            <p>Se registró un cambio en la alarma <strong>'${alarm.nombre}'</strong>.</p>
            <p>${mensaje}</p>
            <a href='${baseURL}/panel/verestadoalarma/${token}' style="font-size: 1.5rem; color: white; background-color: green; padding: 10px;">Ver alarma</a>
            <p style="color: DodgerBlue"><strong>MDV SRL</strong> 2025 ©</p>
        </div>
    `;

    let mailOptions = {
        from: 'admin@impulsainternet.com',
        to: email,
        subject: `Alarma ${alarm.disparada == 1 ? 'disparada' : 'reseteada'} - ${alarm.nombre} - MDV Sensores`,
        html: emailContent
    };

    const results = await transporter.sendMail(mailOptions);  
         
    return results.rejected.length == 0;
}

export const sendActivation = async (token, userData) => {
    const baseURL = process.env.BASE_URL_FRONT;
    const activationLink =`${baseURL}/panel/usuarios/activar/${token}`;
    let mailOptions = {
        from: 'admin@impulsainternet.com',
        to: userData.email,
        subject: 'Reseteo de contraseña - MDV Sensores',
        html: `
                <div style="font-size: 1rem">
                    <h1 style="color: green">Configuraciones de seguridad</h1>
                    <p>Hola ${userData.nombre_1} ${userData.apellido_1}, para poder empezar o seguir usando <strong>MDV Sensores</strong> debemos confirmar su correo electrónico y deberá resetear su contraseña</p>
                    <p>Estas acciones son requerida para verificar su correo electrónico y mantener la seguridad, ya que este mismo será en el cual le llegarán las alarmas de los sensores</p>
                    <h2>Pasos a seguir:</h2>
                    <ol>
                        <li>Click en este enlace: <a href=${activationLink} target="_blank">ACTIVAR</a></li>
                        <li>Definir una contraseña, de acuerdo a nuestras medidas de seguridad. </li>
                        <li>Ingresar a MDV Sensores, en este enlace: <a href='${baseURL}/inicio'  target="_blank">INGRESAR</a></li>
                    <ol>
                    <p style="color: DodgerBlue"><strong>MDV SRL</strong> 2025 ©</p>
                </div>
                `
        };  

        const results = await transporter.sendMail(mailOptions);        
        if (results.rejected.length == 0){
            console.log('Correo enviado correctamente!');
            return true;
        }else{
            console.log('Error al enviar el correo', results);
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