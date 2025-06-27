<template>
  <div class="wheel-container">
    <div class="wheel" :style="wheelStyle" @click="startSpin">
      <div 
        v-for="(item, index) in prizes" 
        :key="index" 
        class="wheel-item" 
        :style="getItemStyle(index)"
      >
        {{ item.name }}
      </div>
    </div>
    <div class="wheel-pointer" @click.stop="startSpin"></div>
    <div class="result" v-if="result">恭喜获得：{{ result }}</div>
  </div>
</template>

<script>
export default {
  name: 'DaZhuanPan',
  data() {
    return {
      prizes: [
        { name: '一等奖', color: '#FF0000' },
        { name: '二等奖', color: '#FF7F00' },
        { name: '三等奖', color: '#FFFF00' },
        { name: '四等奖', color: '#00FF00' },
        { name: '五等奖', color: '#0000FF' },
        { name: '六等奖', color: '#8B00FF' }
      ],
      spinning: false,
      result: '',
      rotateAngle: 0
    }
  },
  computed: {
    wheelStyle() {
      return {
        transform: `rotate(${this.rotateAngle}deg)`,
        transition: this.spinning ? 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
      }
    }
  },
  methods: {
    getItemStyle(index) {
      const angle = 360 / this.prizes.length
      return {
        transform: `rotate(${angle * index}deg)`,
        backgroundColor: this.prizes[index].color,
        '--item-angle': `${angle}deg`
      }
    },
    startSpin() {
      if (this.spinning) return
      
      this.spinning = true
      this.result = ''
      
      // 随机旋转圈数 (5-10圈)
      const rounds = 5 + Math.floor(Math.random() * 5)
      const anglePerPrize = 360 / this.prizes.length
      const prizeIndex = Math.floor(Math.random() * this.prizes.length)
      // 计算目标角度：确保始终正转 (当前角度 + 多圈旋转 + 指向奖品中心的角度)
      // 调整目标角度为奖品分区起始位置（取消中心偏移）
      const targetAngle = this.rotateAngle + rounds * 360 + prizeIndex * anglePerPrize
      
      // 使用requestAnimationFrame确保动画平滑开始
      requestAnimationFrame(() => {
        this.rotateAngle = targetAngle
      })
      
      setTimeout(() => {
        this.spinning = false
        // 计算最终停止位置对应的奖品
        const finalAngle = (this.rotateAngle % 360 + 360) % 360
        // 调整索引计算为直接使用分区起始位置
        const actualPrizeIndex = Math.floor(finalAngle / anglePerPrize) % this.prizes.length
        this.result = this.prizes[actualPrizeIndex].name
        // 归一化角度值避免累积过大
        this.rotateAngle = finalAngle
      }, 4000)
    }
  }
}
</script>

<style scoped>
.wheel-container {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 20px auto;
}

.wheel {
  position: relative;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: #f5f5f5;
  overflow: hidden;
  cursor: pointer;
}

.wheel-item {
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 50%;
  transform-origin: 0% 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  box-sizing: border-box;
  padding-bottom: 40px;
  text-align: center;
}

.wheel-pointer {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40px;
  height: 40px;
  background: #333;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  cursor: pointer;
  pointer-events: auto;
}

.wheel-pointer::after {
  content: '';
  position: absolute;
  top: -20px;
  left: 50%;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 20px solid #333;
  transform: translateX(-50%);
}

.result {
  margin-top: 20px;
  font-size: 18px;
  font-weight: bold;
  color: #ff5722;
}

@media (max-width: 600px) {
  .wheel {
    width: 250px;
    height: 250px;
  }
}
</style>