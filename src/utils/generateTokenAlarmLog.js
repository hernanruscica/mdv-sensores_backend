import jwt from 'jsonwebtoken';

const generateTokenAlarmLog = (alarmLogId = '' , userId = '' ) => {
  const token = jwt.sign({ alarmLogId , userId}, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });  
  console.log('datos en generateToken',alarmLogId, userId, token);
  return token;
};

export default generateTokenAlarmLog;
