window.onload = () => {
	class Wujie extends HTMLElement {
		constructor() {
			super()
			// 进行绑定 创建shadowdom
			let dom = this.attachShadow({
				mode:"open"
			})
			let template = document.querySelector('#wujie') as HTMLTemplateElement
			dom.appendChild(template.content.cloneNode(true))
			console.log(this.getAttr('url'));
			
		}
		private getAttr(attr: string) {
			// 读取参数
			return this.getAttribute(attr)
		}

		//生命周期自动触发有东西插入
		connectedCallback () {
				console.log('类似于vue 的mounted');
		}
		//生命周期卸载
		disconnectedCallback () {
					console.log('类似于vue 的destory');
		}
		//跟watch类似
		attributeChangedCallback (name:any, oldVal:any, newVal:any) {
				console.log('跟vue 的watch 类似 有属性发生变化自动触发');
		}

	}
	// 进行挂载 不允许驼峰 类似于组件 原生写法
	window.customElements.define('wu-jie',Wujie)
}