
function numToWords(num) {
    // 四位进行分割
    const numStr = num.toString().replace(/(?=(\d{4})+$)/g, ',')
        .split(',')
        .filter(Boolean)

    const map = {
        零: '零',
        一: '壹',
        二: '贰',
        三: '叁',
        四: '肆',
        五: '伍',
        六: '陆',
        七: '柒',
        八: '捌',
        九: '玖',
        十: '拾',
        百: '佰',
        千: '仟',
        万: '萬',
        亿: '亿',
    }


    const chars = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    const units = ["", "十", "百", "千"];

    const bigUnits = ["", "万", "亿"];
    let result = ''
    for (let i = 0; i < numStr.length; i++) {
        const part = numStr[i];
        const c = _transform(part)
        let u = bigUnits[numStr.length - i - 1];
        if (c === chars[0]) {
            u = ''
        }
        result += c + u
        console.log('打印***c', c, u, part)
    }
    result = _handleZero(result)
    return result.split('').map(s => map[s]).join('')

    function _handleZero(str) {
        return str.replace(/零{2,}/g, '零').replace(/零+$/, '')
    }

    function _transform(n) {
        if (n === '0000') {
            return chars[0]
        }

        let result = ''
        for (let i = 0; i < n.length; i++) {
            // 转换汉字
            const c = chars[+n[i]];
            // 加单位 得到单位
            let u = units[n.length - 1 - i]
            if (c === chars[0]) {
                u = ''
            }
            result += c + u
        }
        return _handleZero(result)
    }
    console.log('打印***numStr', num.toString(), numStr)
}
console.log('打印***numToWords(10)', numToWords(1234))

