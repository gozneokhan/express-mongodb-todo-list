/*** #2 mongodb와 연결하는 함수 구현 ***/
import mongoose from 'mongoose';

const connect = () => {
  mongoose
    .connect(
      'mongodb+srv://<id>:<password>@express-mongo.inu85hz.mongodb.net/?retryWrites=true&w=majority&appName=express-mongo',
      {
        dbName: 'todo_list_db',
      },
    )
    .then(() => console.log('MongoDB 연결에 성공했습니다.'))
    .catch((err) => console.log(`MongoDB 연결에 실패하였습니다. ${err}`));
};

//* service중 발생하는 에러 처리
mongoose.connection.on('error', (err) => {
  console.error('MongoDB 연결 에러', err);
});

export default connect;
