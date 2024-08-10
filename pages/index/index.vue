<template>
	<view class="content">
		<view class="homeLayout">
			<view class="head">
				<home-head>
				</home-head>
			</view>
			<view class="body">
				<view class="swiperOut">
					<swiper vertical @change="swiperChange">
						<swiper-item v-for="(item,index) in listData" :key="index">
							<view class="content">
								<view class="soupGroupTab">
									<view class="tab" v-if="true">
										<view class="icon">
											<image src="/static/images/xin-icon.png" mode="aspectFit"></image>
										</view>
										<view class="text">心灵鸡汤</view>
									</view>
									<view class="tab" v-if="false">
										<view class="icon">
											<image src="/static/images/du-icon.png" mode="aspectFit"></image>
										</view>
										<view class="text">毒鸡汤</view>
									</view>
								</view>

								<text class="main">
									{{currentIndex}} -- {{lineWidth}}
									别跟傻瓜吵架，\n
									不然旁人会搞不清楚，\n
									到底谁是傻瓜。\n
									别跟傻瓜吵架，\n
									不然旁人会搞不清楚，\n
									到底谁是傻瓜。\n
									别跟傻瓜吵架，\n
									不然旁人会搞不清楚，\n
									到底谁是傻瓜。
								</text>

								<view class="author">
									<view class="line"></view>
									<view class="userInfo">
										<view class="avatar">
											<image src="/static/images/logo.png" mode="aspectFit"></image>
										</view>
										<view class="name">张三</view>
										<view class="from">摘自：红楼梦</view>
									</view>

								</view>
							</view>

							<view class="info">
								<view class="left">
									<view class="item">
										<uni-icons type="redo" color="#999" size="28"></uni-icons>
									</view>
									<text></text>
								</view>
								<view class="right">
									<view class="item">
										<uni-icons v-if="true" type="heart" color="#999" size="28"></uni-icons>
										<uni-icons v-else type="heart-filled" color="#dd524d" size="28"></uni-icons>
										<text>11</text>
									</view>
									<view class="item">
										<uni-icons v-if="true" type="star" color="#999" size="28"></uni-icons>
										<uni-icons v-else type="star-filled" color="#dd524d" size="28"></uni-icons>
										<text>12</text>
									</view>
									<view class="item">
										<uni-icons type="chatbubble" color="#999" size="28"></uni-icons>
										<text>13</text>
									</view>
								</view>
							</view>
						</swiper-item>

						<swiper-item class="ad">
							<view class="message">
								<view class="title">小主，今日鸡汤已干完！</view>
								<text class="des">每日5碗鸡汤，如果想要加餐，\n点击下方看广告按钮，可继续推送5碗，\n每日最多加餐5次。</text>
							</view>
							<view class="btnGroup">
								<view class="btn">看广告刷新
								</view>
								<view class="text">今日还有5次机会
								</view>
							</view>
						</swiper-item>
					</swiper>
				</view>
				<view class="progress">
					<view class="line" :style="{width: lineWidth + '%'}"></view>
				</view>
			</view>
		</view>

		<uni-popup ref="usePopup" type="center" @maskClick="closeUsePopup">
			// <view class="usePopup">
				<image src="/static/images/upward.png" mode="heightFix" @click="closeUsePopup"></image>
			</view>
		</uni-popup>

	</view>
</template>

<script setup>
	import {
		computed,
		ref
	} from "vue"
	import {onReady} from "@dcloudio/uni-app"

	const listData = ref([1, 2, 3, 4, 5]);
	const currentIndex = ref(0);
	const usePopup = ref(null);
	
	onReady(() => {
		// 读取缓存中的 点击记录，默认为false
		let useState = uni.getStorageSync("useState") || false;
		// 用户没有点击过，才展示
		if(!useState) usePopup.value.open();
	})

	// 轮播切换事件
	const swiperChange = (e) => {
		currentIndex.value = e.detail.current;
	}

	// 进度条的宽度：索引值 占 数组长度的百分比
	const lineWidth = computed(() =>
		currentIndex.value / (listData.value.length) * 100
	)
	// 点击操作的遮罩层
	const closeUsePopup = () => {
		// 关闭遮罩
		usePopup.value.close();
		
		// 记录点击过
		uni.setStorageSync("useState", true);
	}
</script>

<style lang="scss">
.homeLayout {
	height: 100vh;
	background: #BDE1FB;
	display: flex;
	flex-direction: column;

	.head {
		height: 360rpx;
	}

	.body {
		flex: 1;
		background: white;
		border-radius: 50rpx 50rpx 0 0;
		overflow: hidden;

		.swiperOut {
			height: calc(100% - 8rpx);

			swiper {
				height: 100%;

				&-item {
					.content {
						height: calc(100% - 130rpx);
						// border: 1px solid red;
						display: flex;
						justify-content: center;
						flex-direction: column;
						padding: 0 30rpx;

						.soupGroupTab {
							.tab {
								height: 40rpx;
								background-color: #aaa;
								width: fit-content;
								display: flex;
								font-size: 26rpx;
								font-weight: 400;
								padding: 0 20rpx;
								border-radius: 56rpx;
								letter-spacing: normal;

								.icon {
									display: flex;
									width: 36rpx;
									height: 36rpx;
									border-radius: 50%;
									align-items: center;
									justify-content: center;

									image {
										height: 80%;
										width: 80%;
									}
								}

								.text {
									padding-left: 10rpx;
								}
							}

							.tab:nth-child(1) {
								background: #FFF3F7;

								.icon {
									background-image: linear-gradient(to right, #f83162, #ff7795);
								}
							}

							.tab:nth-child(2) {
								background: #EDFDE0;

								.icon {
									background-image: linear-gradient(to right, #4F9153, #4bbb8b);
								}
							}
						}

						.main {
							font-size: 50rpx;
							font-weight: lighter;
							width: 100%;
							letter-spacing: 0.05em;
							line-height: 1.8em;
							margin-top: 10rpx;
							margin-bottom: 60rpx;
							@include maxline(5);
						}

						.author {
							.line {
								width: 70rpx;
								height: 5rpx;
								background: #f0f0f0;
							}

							.userInfo {
								display: flex;
								align-items: center;
								font-size: 26rpx;
								coor: #888;
								padding-top: 30rpx;
							}

							.avatar {
								width: 40rpx;
								height: 40rpx;

								image {
									height: 100%;
									width: 100%;
								}
							}

							.name {
								padding-left: 12rpx;
							}

							.from {
								padding-left: 12rpx;
							}
						}
					}

					.info {
						height: 130rpx;
						display: flex;
						justify-content: space-between;
						align-items: center;
						padding: 0 30rpx;

						.item {
							display: flex; // 一行显示
							align-items: center;
							padding: 10rpx 15rpx;
							// border: 1px solid red;
							columns: #999;
						}

						.left {
							display: flex;

							.item {
								padding-left: 0;
							}
						}

						.right {
							display: flex;

							.item:last-child {
								padding-right: 0;
							}
						}
					}
				}

				.ad {
					background: #F8F8F8;
					// padding: 0rpx 30rpx;
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					align-items: center;
					text-align: center;

					.message {
						background: #fff;
						border-radius: 30rpx;
						padding: 40rpx;
						margin-top: 200rpx; // 距离外壳的高度

						.title {
							font-size: 46rpx;
							padding-bottom: 20rpx;
							border-bottom: 1px solid #eee;
							margin-bottom: 20rpx;
						}

						.des {
							font-size: 32rpx;
							color: #555;
							line-height: 1.8em;
						}
					}

					.btnGroup {
						font-size: 30rpx;

						.btn {
							width: 400rpx;
							height: 100rpx;
							border-radius: 100rpx;
							background: linear-gradient(to top, #93c4ff, #b1e1ff);
							display: flex;
							justify-content: center;
							align-items: center;
							font-size: 38rpx;
							color: #203e5f;
							margin-bottom: 10rpx;
						}

						.text {
							padding: 20rpx 0;
						}
					}
				}
			}
		}

		.progress {
			height: 8rpx;
			width: 100%;
			background: #ffffff;

			.line {
				height: 100%;
				width: 50%;
				background: linear-gradient(to right, #fdd4f1, #74dbef);
			}
		}

	}
}

.usePopup{
	// border: 1px solid red;
	padding-top: 15vh;
	image{
		height: 150rpx;
		transform: translateY(100rpx);
		opacity: 0;
		animation: useAnimate 1.5s infinite;
	}
}

@keyframes useAnimate {
	0%{
		transform: translateY(100rpx);
		opacity: 0;
	}
	100%{
		transform: translateY(-100rpx);
		opacity: 1;  // 透明度
	}
};
</style>