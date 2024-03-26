/*** #3 mongoose-schemas 설계 ***/
import mongoose from 'mongoose';

const TodoSchema = new mongoose.Schema({
  value: {
    //* 해야할 일
    type: String,
    required: true,
  },
  order: {
    //* 할 일의 순서
    type: Number,
    required: true,
  },
  doneAt: {
    //* 완료된 날짜 지정
    type: Date, //* doneAt 필드는 Date 타입을 가집니다.
    required: false, //* 해야할 일이 생성 후 완료 x => null 할당, 완료 o => 현재 시간 표시
  },
});

//* frontend 서빙을 위한 코드
TodoSchema.virtual('todoId').get(function () {
  return this._id.toHexString();
});
TodoSchema.set('toJSON', {
  virtuals: true,
});

//* TodoSchema를 바탕으로 Todo 모델을 생성, 외부로 내보내기
export default mongoose.model('Todo', TodoSchema);
