//封装弹窗
export function showToast(title="",icon="none",mask=true){
	let posttion = icon=='none' ? 'bottom' :"center";
	uni.showToast({
		title,
		icon,
		mask,
		posttion
	})
}