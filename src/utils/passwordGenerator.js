/**
 * 密码生成工具函数
 * 使用 Web Crypto API 生成加密安全的随机密码
 */

/**
 * 生成加密安全的随机数
 */
function getRandomValues(length) {
  const array = new Uint32Array(length)
  crypto.getRandomValues(array)
  return array
}

/**
 * 从字符集中随机选择字符
 */
function getRandomChar(charSet) {
  const randomValues = getRandomValues(1)
  const randomIndex = randomValues[0] % charSet.length
  return charSet[randomIndex]
}

/**
 * 生成密码
 * @param {Object} options - 密码生成选项
 * @param {number} options.length - 密码长度
 * @param {boolean} options.includeUppercase - 包含大写字母
 * @param {boolean} options.includeLowercase - 包含小写字母
 * @param {boolean} options.includeNumbers - 包含数字
 * @param {boolean} options.includeSymbols - 包含特殊字符
 * @param {boolean} options.excludeSimilar - 排除相似字符
 * @param {boolean} options.excludeAmbiguous - 排除歧义字符
 * @returns {string} 生成的密码
 */
export function generatePassword(options) {
  const {
    length = 16,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
    excludeSimilar = false,
    excludeAmbiguous = false
  } = options

  // 构建字符集
  let charSet = ''

  if (includeUppercase) {
    charSet += excludeSimilar ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  }
  if (includeLowercase) {
    charSet += excludeSimilar ? 'abcdefghijkmnopqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz'
  }
  if (includeNumbers) {
    charSet += excludeSimilar ? '23456789' : '0123456789'
  }
  if (includeSymbols) {
    const symbols = excludeAmbiguous 
      ? '!@#$%^&*()_+-=[]{}|;:,.<>?'
      : '!@#$%^&*()_+-=[]{}|;:,.<>?/~`'
    charSet += symbols
  }

  // 验证字符集不为空
  if (charSet.length === 0) {
    throw new Error('至少需要选择一种字符类型')
  }

  // 生成密码
  let password = ''
  for (let i = 0; i < length; i++) {
    password += getRandomChar(charSet)
  }

  return password
}

/**
 * 计算密码强度
 * @param {string} password - 密码
 * @returns {Object} 强度信息 { score: number, level: string, feedback: string[] }
 */
export function calculatePasswordStrength(password) {
  if (!password) {
    return { score: 0, level: 'weak', feedback: [] }
  }

  let score = 0
  const feedback = []

  // 长度评分
  if (password.length >= 8) score += 10
  if (password.length >= 12) score += 10
  if (password.length >= 16) score += 10
  if (password.length >= 20) score += 10

  // 字符类型评分
  if (/[a-z]/.test(password)) score += 10
  if (/[A-Z]/.test(password)) score += 10
  if (/[0-9]/.test(password)) score += 10
  if (/[^a-zA-Z0-9]/.test(password)) score += 10

  // 复杂度评分
  const uniqueChars = new Set(password).size
  score += Math.min(uniqueChars / password.length * 20, 20)

  // 熵值计算
  const charSetSize = getCharSetSize(password)
  const entropy = password.length * Math.log2(charSetSize)
  score += Math.min(entropy / 10, 10)

  // 限制分数范围
  score = Math.min(Math.max(score, 0), 100)

  // 确定强度等级
  let level = 'weak'
  if (score >= 80) level = 'very-strong'
  else if (score >= 60) level = 'strong'
  else if (score >= 40) level = 'medium'
  else level = 'weak'

  // 生成反馈建议
  if (password.length < 8) {
    feedback.push('密码长度至少应为 8 个字符')
  }
  if (password.length < 12) {
    feedback.push('建议使用 12 个字符以上的密码')
  }
  if (!/[a-z]/.test(password)) {
    feedback.push('建议包含小写字母')
  }
  if (!/[A-Z]/.test(password)) {
    feedback.push('建议包含大写字母')
  }
  if (!/[0-9]/.test(password)) {
    feedback.push('建议包含数字')
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    feedback.push('建议包含特殊字符')
  }
  if (uniqueChars / password.length < 0.5) {
    feedback.push('建议使用更多不同的字符')
  }

  return { score, level, feedback }
}

/**
 * 计算密码使用的字符集大小
 */
function getCharSetSize(password) {
  let size = 0
  if (/[a-z]/.test(password)) size += 26
  if (/[A-Z]/.test(password)) size += 26
  if (/[0-9]/.test(password)) size += 10
  if (/[^a-zA-Z0-9]/.test(password)) size += 32 // 估算特殊字符数量
  return size
}

/**
 * 获取强度等级的中文名称
 */
export function getStrengthLabel(level) {
  const labels = {
    'weak': '弱',
    'medium': '中等',
    'strong': '强',
    'very-strong': '非常强'
  }
  return labels[level] || '弱'
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch (err) {
      document.body.removeChild(textArea)
      return false
    }
  }
}
