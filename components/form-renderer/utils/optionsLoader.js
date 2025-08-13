// 获取选择框选项
export async function getSelectOptions(apiConfig) {
    if (!apiConfig?.url) return []

    try {
        const [error, response] = await uni.request({
            url: apiConfig.url,
            method: apiConfig.method || 'GET',
            data: apiConfig.method === 'POST' ? JSON.parse(apiConfig.params || '{}') : {},
            header: {
                'Authorization': 'Bearer ' + uni.getStorageSync('token')
            }
        })

        if (error) {
            throw error
        }

        // 根据数据路径获取数据
        let data = response.data
        if (apiConfig.dataPath) {
            const paths = apiConfig.dataPath.split('.')
            for (const path of paths) {
                data = data[path]
            }
        }

        // 映射字段
        if (Array.isArray(data)) {
            const props = apiConfig.props || {}
            return data.map(item => ({
                label: item[props.label || 'label'],
                value: item[props.value || 'value'],
                disabled: item[props.disabled || 'disabled'] || false,
                group: item[props.group || 'group']
            }))
        }

        return []
    } catch (error) {
        console.error('Load options error:', error)
        return []
    }
}

// 获取级联选择器选项
export async function getCascaderOptions(apiConfig, parentId) {
    if (!apiConfig?.url && !apiConfig?.lazyUrl) return []

    try {
        const url = parentId !== undefined ? apiConfig.lazyUrl : apiConfig.url
        const params = {
            ...(apiConfig.method === 'GET' ? JSON.parse(apiConfig.params || '{}') : {}),
            parentId
        }

        const [error, response] = await uni.request({
            url,
            method: apiConfig.method || 'GET',
            data: apiConfig.method === 'POST' ? params : {},
            header: {
                'Authorization': 'Bearer ' + uni.getStorageSync('token')
            }
        })

        if (error) {
            throw error
        }

        // 根据数据路径获取数据
        let data = response.data
        if (apiConfig.dataPath) {
            const paths = apiConfig.dataPath.split('.')
            for (const path of paths) {
                data = data[path]
            }
        }

        // 映射字段
        if (Array.isArray(data)) {
            const props = apiConfig.props || {}
            return data.map(item => ({
                label: item[props.label || 'label'],
                value: item[props.value || 'value'],
                children: item[props.children || 'children'],
                disabled: item[props.disabled || 'disabled'] || false,
                leaf: item[props.leaf || 'leaf']
            }))
        }

        return []
    } catch (error) {
        console.error('Load cascader options error:', error)
        return []
    }
}