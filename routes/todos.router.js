/*** #4 API 구현 ***/
import express from 'express';
import joi from 'joi';
import Todo from '../schemas/todo.schemas.js';
import joi from 'joi';

/**
 * #6 Joi 유효성 검증
 * 1. value 데이터는 필수적으로 존재
 * 2. value 데이터는 문자열 타입
 * 3. value 데이터는 최소 1글자 이상
 * 4. value 데이터는 최대 50글자 이하
 * 5. 유효성 검사에 실패했을 때, 에러가 발생
 **/
const createdTodoSchema = joi.object({
  // createdTodoSchema는 object를 이용하여 검증을 진행
  value: joi.string().min(1).max(50).required(), //  그 오브젝트 안에 vlaue: 라는 key를 바탕으로 가지고 감
});

const router = express.Router();

/** 해야할 일 등록 API **/
// async() 비동기 처리를 사용하는 이유: 데이터 베이스를 사용하게 되면 데이터를 조회하는 시간동안 해당하는 프로그램이 멈추거나, 해당하는 데이터를 조회하면 정상적인 데이터가 조회되지 않을 수 있음
router.post('/todos', async (req, res, next) => {
  try {
    // 1. 클라이언트로 부터 받아온 value 데이터를 가져오기
    // const { value } = req.body;
    /** #6 검증에 실패하여 에러 발생 **/
    const validation = await createdTodoSchema.validateAsync(req.body); // req.body에 있는 데이터를 createdTodoSchema를 바탕으로 검증을 진행

    /** #6 검증에 성공 시 validation에서 반환된 값 사용 **/
    const { value } = validation;

    // 1-5. 만약, 클라이언트가 value 데이터를 전달하지 않았을 때, 클라이언트에게 400 에러 메시지를 전달
    if (!value) {
      return res
        .status(400)
        .json({ errorMessage: '해야할 일(value) 데이터가 존재하지 않습니다.' });
    }

    // 2. 해당하는 마지막 order 데이터를 조회
    // findOne() = 1개의 데이터만 조회
    // sort = 정렬한다. -> 어떤 컬럼을? -> 'order'컬럼을 -를 사용해 내림차순으로 정리하고 Todo 데이터커넥션에서 하나의 데이터를 찾음
    // mongoose에서 exec()는 결과를 반환하기 위해서 쿼리를 실행하고, promise를 반환 => 즉, 해당하는 데이터를 조회할 때, exec()를 사용해서 프로미스로 동작하게 만들어서 await를 작동하게 만듬 -> 데이터를 조회할 때는 필수
    const todoMaxOrder = await Todo.findOne().sort('-order').exec();

    // 3. 만약 하나의 데이터가 존재한다면 현재 해야 할 일을 +1 할당하고, order 데이터가 존재하지 않는다면, 가장 첫 번째 1로 할당
    const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;

    // 4. 해야할 일 등록
    const todo = new Todo({ value, order }); // new Todo({ value, order }); 두가지의 데이터를 등록해 todo 라는 변수에 할당 => 인스턴스 형식으로 만듬
    await todo.save(); // 실제 데이터 베이스에 저장

    // 5. 해야할 일을 클라이언트에게 반환
    return res.status(201).json({ todo: todo });
  } catch (error) {
    /** #7 에러처리 미들웨어 - Router 다음에 있는 에러 처리 미들웨어를 실행 **/
    next(error);
  }
});

/** 해야할 일 목록 조희 API **/
router.get('/todos', async (req, res, next) => {
  // 1. 해야할 일 목록 조회를 진행
  // await을 써서 데이터베이스가 전부 데이터를 조회하는 동안 기다리는 다음 줄에 있는 코드를 실행
  // Todo schema에서 반환한 Todo mongoose 모델을 바탕으로 사용
  // find()를 통해 여러개의 데이터 목록 조회
  const todos = await Todo.find().sort('-order').exec();

  // 2. 해야할 일 목록 조회 결과를 클라이언트에게 반환
  return res.status(200).json({ todos });
});

/** 해야할 일 순서 변경 API **/
// main logic todoId를 통해 해야할 일 currentTodo를 찾음 -> currentTodo 해야할 일이 있고 order 순서를 전달 받았을 때- > currentTodo.order = order; 순서 변경 -> 변경된 해야할 일  실제 데이터 베이스에 저장
// todoId 경로 매개변수는 어떤 해야할 일을 수정해야 할지 알기 위해 사용
router.patch('/todos/:todoId', async (req, res, next) => {
  const { todoId } = req.params; // 경로 매개변수 /:todoId에서 가져오기 때문에 req.params에 들어있는 todoId를 바탕으로 조회
  const { order, done, value } = req.body; // 클라이언트가 해당하는 값을 몇 번 순서로 변경할 건지에 대한 내용을 가져옴 // done 추가, value 추가

  // 1. 현재 나의 order가 무엇인지 알아야함
  const currentTodo = await Todo.findById(todoId).exec(); // Todo 모델을 바탕으로 하나의 데이터를 조율 findById()를 통해 todoId에 해당하는 특정한 아이디를 가져옴

  // 1-5. 만약 todoId에 해당하는 해야할 일이 없을 경우? -> 에러메시지 반환(클라이언트가 전달한 데이터가 존재하지 않는다 -> 404에러 Not Found)
  if (!currentTodo) {
    return res
      .status(404)
      .json({ errorMessage: '존재하지 않는 해야할 일 입니다.' });
  }

  // 2. 해야할 일 순서변경, 완료 / 해제, 내용 변경 API
  if (order) {
    // order라는 값이 있을 때만 할 일 순서 변경
    const targetTodo = await Todo.findOne({ order }).exec(); // findOne()을 통해 order 변수 값, 하나의 데이터만 조회
    if (targetTodo) {
      // targetTodo가 존재 했을때만 비즈니스 로직을 수행하게 구현 -> 해야할 일에 정보가 있다면 이미 가지고 있는 데이터의 순서와 바꿈
      targetTodo.order = currentTodo.order;
      await targetTodo.save(); // 실제 데이터 베이스에 저장
    }
    // 현재 변경하려는 targetTodo의 값을 전달 받은 order값으로 구현
    currentTodo.order = order;
  }

  // done이 null 혹은 true인 상태일 때에만 해당하는 조건문에 들어옴
  const doneValue = done === 'true' ? true : false; // done 값이 "true"면 true, 그렇지 않으면 false로 설정
  if (done !== undefined) {
    currentTodo.doneAt = doneValue ? new Date() : null; // done이라는 값을 전달받아 할 일 완료/해제 기능 구현(done 값이 true면 완료  및 doneAt 필드에 시간 기록, false면 doneAt 필드 null)
  }

  if (value) {
    currentTodo.value = value;
  }

  await currentTodo.save(); // todoId에 해당하는 변경된 해야할 일 또한, 실제 데이터 베이스에 저장

  return res.status(200).json({}); // 최종 적으로 retrn하면서 단순한 객체만 전달
});

/** 해야할 일 삭제 API  **/
router.delete('/todos/:todoId', async (req, res, next) => {
  const { todoId } = req.params;

  const todo = await Todo.findById(todoId).exec(); //findById()를 통해 해당하는 mongoose에 데이터가 전달하는 todoId와 일치했을 때 조회
  if (!todo) {
    return (
      res.status(404),
      json({ errorMessage: '존재하지 않는 해야할 일 정보입니다.' })
    );
  }

  // mongodb에서는 _id 값이 전달받은 todoId에 해당
  await Todo.deleteOne({ _id: todoId }); // 하나의 데이터 삭제하기 위해  deleteOne() 사용, 기본 키 삭제를 위해 _id 사용 => 어떤 값을 기준으로 해당하는 데이터에 일치했을 때, 삭제할지 지정 가능

  return res.status(200).json({});
});

export default router;
