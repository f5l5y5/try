// src/mock/api.ts
import Mock from 'mockjs'
export const baseResponse = (
  data,
  code = 1
) => ({
  code,
  data,
  message: "mock数据",
});
export default [
  {
    url: '/main/getList',
    method: 'get',
    response: () => {
			const data = []
			console.log('打印***1',1)
      for (let i = 0; i < 10000; i++) {
        data.push({
          id: i + 1,
          name: Mock.Random.cname(),
          time: Mock.Random.time(),
          date: Mock.Random.date(),
        })
      }
      return baseResponse(data)
      // Mock.mock({
      //   // 属性 list 的值是一个数组，其中含有 1 到 10 个元素
      //   'list|10': [
      //     {
      //       // 属性 id 是一个自增数，起始值为 1，每次增 1
      //       'id|+1': 1,
      //       name: '@cname',
      //       time: '@time',
      //       date: '@date',
      //     },
      //   ],
      // }),
    },
  },
]
