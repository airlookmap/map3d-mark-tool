<template>
	<div class="readme-wrap" :class="{ active: !isCollapse }">
		<span class="open-close" @click="isCollapse = !isCollapse">{{ isCollapse ? '使用说明' : '收起' }}</span>
		<section class="content">
			<ul class="list">
				<li class="list-item" v-for="v in contents" :key="v.slice(0,2)" v-html="v">
					{{ v }}
				</li>
			</ul>
		</section>
	</div>
</template>

<script>
const contents = [
`1. 场景初始化： <br /> 首先输入需要加载三维数据必填信息(appkey、经度、纬度)，然后点击加载按钮，
即可加载到对应的三维场景。<br /> （可在<a href="https://console.map.airlook.com" target="_blank">控制台</a>系统中
[应用管理菜单] 获取appkey信息; 在[数据预览菜单] 获取对应数据的经纬度坐标信息）`,
`2. 注意事项：<br /> 在进行参数输入时候，请输入合法参数； 在进行包围盒绘制时，请\`逆时针顺序\`进行添加点进行绘制。`,
`	3. 具体功能操作： <br />
3-1 点击\`坐标拾取\`，然后鼠标左击三维场景，即可在左下角看到 log 信息，点击取消则结束坐标拾取操作；<br />
3-2 点击\`添加标注\`，然后左击三维场景选取坐标点，则弹出标注配置信息窗口，
可以对 icon、名称等信息进行编辑，点击确认则输出相应标注的 log 信息；<br />
3-3 点击 \`获取相机信息\`，则输出相机位置以及偏移 log 信息；<br />
3-3 点击 \`绘制包围盒\`，然后左击依次添加点绘制包围多边形（目前只支持逆时针顺序绘制,暂不支持凹多边形），然后点击结束即可完成（点少于三个则默认取消绘制），并且支持撤销点操作。`,
`4. 辅助功能： <br />
点击 \`清除所有标记\` 即可清除场景中所有标注； 点击 \`清除所有包围盒\` 即可清除场景中所有包围盒。
（由于此工具禁用了标注聚合功能，为了防止场景添加标注或者包围盒数量较大，而造成场景渲染效率低下影响用户体验，因此添加了清除功能）`,
]
export default {
	name: 'readme',
	data() {
		return {
			isCollapse: true,
			contents: contents,
		}
	}
}
</script>
<style lang="scss" scoped>
.readme-wrap {
	display: flex;
	position: fixed;
	right: -400px;
	will-change: auto;
	transition: all .5s ease;
	bottom: 2px;
	color: #fff;
	height: 250px;
	width: 400px;
	&.active {
		right: 0;
	}
	.open-close {
		cursor: pointer;
		text-align: center;
		left: -22px;
		position: absolute;
		display: block;
		width: 18px;
		padding: 2px;
		border-width: 1px;
		border-radius: 5px 0 0 5px;
		top: 0;
		background-color: #409eef;
	}
	.content {
		padding: 10px 0 10px 20px;
		text-align: left;
		background: rgba(255, 255, 255, 0.5);
		display: flex;
		width: 100%;
		font-size: 14px;
		.list {
			padding-right: 10px;
			overflow: auto;
			list-style: none;
			display: flex;
			flex-direction: column;
			// justify-content: space-around;
			padding: 0;
			color: #000;
			letter-spacing: 1px;
			line-height: 16px;
		}

		.list-item {
			margin-bottom: 10px;
		}
	}
}
</style>