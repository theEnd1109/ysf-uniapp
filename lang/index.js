const context = require.context('./', true, /^\.\/(zh-cn|en)\/.+\.js$/)

const messages = {}

context.keys().forEach((key) => {
	const match = key.match(/^\.\/([^/]+)\/(.+)\.js$/)
	if (!match) return

	const lang = match[1]
	const path = match[2]
	const keys = path.split('/')

	// 容错：打印当前加载文件的信息
	console.log(`[i18n] 加载文件: ${lang}/${path}`)

	if (!messages[lang]) messages[lang] = {}

	let targetKeys = [...keys]
	// 如果文件夹名称和文件名称同名,保留一个
	// if (keys.length >= 2 && keys[keys.length - 1] === keys[keys.length - 2]) {
	// 	targetKeys.pop()
	// }

	let current = messages[lang]
	targetKeys.forEach((k, idx) => {
		if (idx === targetKeys.length - 1) {
			current[k] = context(key).default || context(key)
		} else {
			current[k] = current[k] || {}
			current = current[k]
		}
	})
})
console.log(JSON.stringify(messages));
export default messages