/*** #1 기본 세팅 ***/
import express from 'express';
import connect from './schemas/index.js'; /** #2 index 파일에 있는 connect import **/
import todosRouter from './routes/todos.router.js'; /** #4 express route 연결을 위한 import **/
import errorHandlerMiddleware from './middlewares/error-handler.middleware.js'; /** #7 에러처리 미들웨어 import **/

const app = express();
const SERVER_PORT = 3000;

connect(); /** #2 connect 실행 **/

//* app.use를 통해 전역 미들웨어를 등록하게 됨 -> 위에서 아래로 순차적으로 동작
//* express에서 req.body에 접근하여 데이터를 사용할 수 있도록 설정
app.use(express.json()); //* // JSON 데이터를 파싱하기 위한 설정 (미들웨어 1)
app.use(express.urlencoded({ extended: true })); //*  URL 인코딩된 데이터를 파싱하기 위한 설정 (미들웨어 2)

//* 해당하는 모든 frontend 파일 서빙
app.use(express.static('./assets')); //* (미들웨어 3)

/*** #5 Request 로그를 남기는 middleware 구현 ***/
app.use((req, res, next) => {
  console.log('Request URL:', req.originalUrl, ' - ', new Date());
  next();
}); //* (미들웨어 4)

const router = express.Router(); //* express에 Router 기능 사용

router.get('/', (req, res) => {
  return res.json({ message: 'Hello World!' });
});

app.use('/api', [router, todosRouter]); //* '/api' 경로에만 해당 api가 접근가능, /**#4 현재 해당하는 /api 경로에 요청을 처리하기 위해서 todoRouter 배열로 추가 => express router에 연결**/ (미들웨어 5)

/** #7 에러 처리 미들웨어 등록 **/
app.use(errorHandlerMiddleware); //* (미들웨어 6)_에러 처리 미들웨어는 Router 하단인 이유?: 라우터 이전에 에러 처리 미들웨어를 등록하면 라우터에서 발생한 에러를 처리 할 수 없음

app.listen(SERVER_PORT, () => {
  console.log(SERVER_PORT, '포트로 서버가 열렸습니다.');
});
