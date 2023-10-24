import Mock from 'mockjs'
import {API_PREFIX} from "../../utils/request";

const welcome = Mock.mock({
  timeFix: '@TIMEFIX',
  message: '@WELCOME'
})

Mock.mock(`${API_PREFIX}/user/welcome`, 'get', () => {
  return welcome
})
