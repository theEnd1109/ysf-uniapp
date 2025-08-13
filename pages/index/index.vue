<template>
	<view class="content">
		<image class="logo" src="/static/logo.png"></image>
		<view class="text-area">
			<text class="title">{{$t('article.article.title')}}:{{title}}</text>
		</view>
		<button @click="changeLang('zh-cn')">中文</button>
		<button @click="changeLang('en')">English</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: "test"
			}
		},
		onLoad() {

		},
		methods: {
			changeLang(lang) {
				uni.setStorageSync('lang', lang)
				this.$i18n.locale = lang
				uni.reLaunch({ url: '/pages/index/index' })
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>
