export function parseTime(time, cFormat) {
	if (arguments.length === 0) {
		return null
	}
	const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
	let date
	if (typeof time === 'object') {
		date = time
	} else {
		if (typeof time === 'string' && /^[0-9]+$/.test(time)) {
			time = parseInt(time)
		}
		if (typeof time === 'number' && time.toString().length === 10) {
			time = time * 1000
		}
		date = new Date(time)
	}
	const formatObj = {
		y: date.getFullYear(),
		m: date.getMonth() + 1,
		d: date.getDate(),
		h: date.getHours(),
		i: date.getMinutes(),
		s: date.getSeconds(),
		a: date.getDay(),
	}
	return format.replace(/{([ymdhisa])+}/g, (result, key) => {
		let value = formatObj[key]
		if (key === 'a') {
			return ['日', '一', '二', '三', '四', '五', '六'][value]
		}
		if (result.length > 0 && value < 10) {
			value = '0' + value
		}
		return value || 0
	})
}

/**
 * @description 格式化时间
 * @param time
 * @param option
 * @returns {string}
 */
export function formatTime(time, option) {
	if (('' + time).length === 10) {
		time = parseInt(time) * 1000
	} else {
		time = +time
	}
	const d = new Date(time)
	const now = Date.now()

	const diff = (now - d) / 1000

	if (diff < 30) {
		return '刚刚'
	} else if (diff < 3600) {
		// less 1 hour
		return Math.ceil(diff / 60) + '分钟前'
	} else if (diff < 3600 * 24) {
		return Math.ceil(diff / 3600) + '小时前'
	} else if (diff < 3600 * 24 * 2) {
		return '1天前'
	}
	if (option) {
		return parseTime(time, option)
	} else {
		return (
			d.getMonth() +
			1 +
			'月' +
			d.getDate() +
			'日' +
			d.getHours() +
			'时' +
			d.getMinutes() +
			'分'
		)
	}
}

/**
 * @description 将url请求参数转为json格式
 * @param url
 * @returns {{}|any}
 */
export function paramObj(url) {
	const search = url.split('?')[1]
	if (!search) {
		return {}
	}
	return JSON.parse(
		'{"' +
		decodeURIComponent(search)
		.replace(/"/g, '\\"')
		.replace(/&/g, '","')
		.replace(/=/g, '":"')
		.replace(/\+/g, ' ') +
		'"}'
	)
}

/**
 * @description 父子关系的数组转换成树形结构数据
 * @param data
 * @returns {*}
 */
export function translateDataToTree(
	data,
	key = 'id',
	parent_key = 'parent_id'
) {
	const parent = data.filter(
		(value) => value[parent_key] === '0' || value[parent_key] === ''
	)
	const children = data.filter(
		(value) =>
		value[parent_key] !== '0' &&
		value[parent_key] !== '' &&
		value[parent_key] !== null
	)
	const translator = (parent, children) => {
		parent.forEach((parent) => {
			children.forEach((current, index) => {
				if (current[parent_key] === parent[key]) {
					const temp = JSON.parse(JSON.stringify(children))
					temp.splice(index, 1)
					translator([current], temp)
					typeof parent.children !== 'undefined' ?
						parent.children.push(current) :
						(parent.children = [current])
				}
			})
		})
	}
	translator(parent, children)
	return parent
}

/**
 * @description 树形结构数据转换成父子关系的数组
 * @param data
 * @returns {[]}
 */
export function translateTreeToData(data) {
	const result = []
	data.forEach((item) => {
		const loop = (data) => {
			result.push({
				id: data.id,
				name: data.name,
				parentId: data.parentId,
			})
			const child = data.children
			if (child) {
				for (let i = 0; i < child.length; i++) {
					loop(child[i])
				}
			}
		}
		loop(item)
	})
	return result
}

/**
 * @description 10位时间戳转换
 * @param time
 * @param dataExt
 * @returns {string}
 */
export function tenBitTimestamp(time, dataExt = 'HORIZONTAL') {
	const date = new Date(time * 1000)
	const y = date.getFullYear()
	let m = date.getMonth() + 1
	m = m < 10 ? '' + m : m
	let d = date.getDate()
	d = d < 10 ? '' + d : d
	let h = date.getHours()
	h = h < 10 ? '0' + h : h
	let minute = date.getMinutes()
	let second = date.getSeconds()
	minute = minute < 10 ? '0' + minute : minute
	second = second < 10 ? '0' + second : second
	let year = ''
	switch (dataExt) {
		case 'HORIZONTAL':
		default:
			year = y + '-' + m + '-' + d + ' '
			break
		case 'POINT':
			year = y + '.' + m + '.' + d + ' '
			break
		case 'SLASH':
			year = y + '/' + m + '/' + d + ' '
			break
		case 'CHINESE':
			year = y + '年' + m + '月' + d + '日 '
			break
	}
	return year + h + ':' + minute + ':' + second //组合
}

/**
 * @description 13位时间戳转换
 * @param time
 * @param dataExt
 * @returns {string}
 */
export function thirteenBitTimestamp(time, dataExt = 'HORIZONTAL') {
	const date = new Date(time / 1)
	const y = date.getFullYear()
	let m = date.getMonth() + 1
	m = m < 10 ? '' + m : m
	let d = date.getDate()
	d = d < 10 ? '' + d : d
	let h = date.getHours()
	h = h < 10 ? '0' + h : h
	let minute = date.getMinutes()
	let second = date.getSeconds()
	minute = minute < 10 ? '0' + minute : minute
	second = second < 10 ? '0' + second : second
	let year = ''
	switch (dataExt) {
		case 'HORIZONTAL':
		default:
			year = y + '-' + m + '-' + d + '- '
			break
		case 'POINT':
			year = y + '.' + m + '.' + d + '.'
			break
		case 'SLASH':
			year = y + '/' + m + '/' + d + '/'
			break
		case 'CHINESE':
			year = y + '年' + m + '月' + d + '日 '
			break
	}
	return year + h + ':' + minute + ':' + second //组合
}

/**
 * @description 获取随机id
 * @param length
 * @returns {string}
 */
export function uuid(length = 32) {
	const num = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
	let str = ''
	for (let i = 0; i < length; i++) {
		str += num.charAt(Math.floor(Math.random() * num.length))
	}
	return str
}

/**
 * @description m到n的随机数
 * @param m
 * @param n
 * @returns {number}
 */
export function random(m, n) {
	return Math.floor(Math.random() * (m - n) + n)
}

/**
 * 字符串转时间戳 和PHP类似
 * @param str 字符串
 * @param ext HORIZONTAL|POINT|SLASH 三个值 对应的 - . /
 * @param exp
 * @returns {number}
 */
export function strtotime(str, ext = 'HORIZONTAL', exp = ' ') {
	let _arr = str.split(exp)
	let splitStr = ''
	switch (ext) {
		case 'HORIZONTAL':
			splitStr = '-'
			break
		case 'POINT':
			splitStr = '.'
			break
		case 'SLASH':
			splitStr = '/'
			break
	}
	let _day = _arr[0].split(splitStr)
	_arr[1] = _arr[1] == null ? '0:0:0' : _arr[1]
	let _time = _arr[1].split(':')
	for (let i = _day.length - 1; i >= 0; i--) {
		_day[i] = isNaN(parseInt(_day[i])) ? 0 : parseInt(_day[i])
	}
	for (let i = _time.length - 1; i >= 0; i--) {
		_time[i] = isNaN(parseInt(_time[i])) ? 0 : parseInt(_time[i])
	}
	let _temp = new Date(
		_day[0],
		_day[1] - 1,
		_day[2],
		_time[0],
		_time[1],
		_time[2]
	)
	return _temp.getTime() / 1000
}

/**
 * 获取当前时间戳 和PHP类似
 * @returns {number}
 */
export function time() {
	return parseInt(new Date().getTime() / 1000)
}

/**
 * 处理url地址参数
 * @param url 处理的地址
 */
export function parseQueryString(url) {
	let str = url.split('?')[1]
	let result = {}
	let temp = (str || '').split('&')
	for (let i = 0; i < temp.length; i++) {
		let temp2 = (temp[i] || '').split('=')
		result[temp2[0]] = temp2[1]
	}
	return result
}

/**
 * 替换
 * @param variable 初始字符串
 * @param val 要替换的值
 * @param name 要替换的内容
 * @returns {*|void|string|never}
 */
export function replaceValue(variable, val, name = ':id') {
	return variable.replace(name, val)
}

/**
 * 按照键名升序排序
 * @param dataObject 要排序的json对象
 * @returns {any}
 */
export function ksort(dataObject) {
	let key = Object.keys(dataObject).sort()
	var newObject = {}
	for (let i = 0; i < key.length; i++) {
		newObject[key[i]] = dataObject[key[i]]
	}
	return newObject
}

/**
 * 按照键名逆向排序
 * @param dataObject
 * @returns {{}|boolean}
 */
export function krsort(dataObject) {
	if (typeof dataObject !== 'object') {
		return false
	}
	let key = Object.keys(dataObject).sort().reverse()
	let newObject = {}
	for (let i = 0; i < key.length; i++) {
		newObject[key[i]] = dataObject[key[i]]
	}
	return newObject
}

/**
 * 对数组值升序排序
 * @param dataObject 要排序的json对象
 * @returns {any}
 */
export function sort(dataObject) {
	let arr = []
	Object.keys(dataObject).forEach((item) => arr.push(dataObject[item]))
	let sortArr = arr.sort()
	let sortObj = {}
	for (let i = 0; i < sortArr.length; i++) {
		for (const thatKey in dataObject) {
			if (dataObject[thatKey] === sortArr[i]) {
				sortObj[thatKey] = sortArr[i]
			}
		}
	}
	return sortObj
}

/**
 * 对数组值降序排序
 * @param dataObject
 * @returns {{}|boolean}
 */
export function rsort(dataObject) {
	let arr = []
	Object.keys(dataObject).forEach((item) => arr.push(dataObject[item]))
	let sortArr = arr.sort().reverse()
	let sortObj = {}
	for (let i = 0; i < sortArr.length; i++) {
		for (const thatKey in dataObject) {
			if (dataObject[thatKey] === sortArr[i]) {
				sortObj[thatKey] = sortArr[i]
			}
		}
	}
	return sortObj
}


export function sensitive_process(val, start = 2, end = 2) {
	let _len = val.length
	let str = val.substring(0, start);
	let for_len = _len - start - end;
	if (for_len > 0) {
		for (let i = 0; i < for_len; i++) {
			str += '*';
		}
	}
	str += val.substring(_len - end, _len)
	return str
}
