import jwt from 'jsonwebtoken';

const generateTokenAlarmLog = (alarmLogId = null, userId = null) => {
  return jwt.sign({ alarmLogId , userId}, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

export default generateTokenAlarmLog;
