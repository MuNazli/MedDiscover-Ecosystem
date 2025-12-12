import crypto from 'crypto'

const CAPTCHA_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes

function getCaptchaSecret(): string {
  return process.env.CAPTCHA_SECRET || 'dev-captcha-secret-change-in-production'
}

interface CaptchaPayload {
  answer: string
  exp: number
}

function signCaptcha(payload: CaptchaPayload): string {
  const data = JSON.stringify(payload)
  const encoded = Buffer.from(data).toString('base64url')
  
  const hmac = crypto.createHmac('sha256', getCaptchaSecret())
  hmac.update(encoded)
  const signature = hmac.digest('base64url')
  
  return `${encoded}.${signature}`
}

function verifyCaptcha(token: string): CaptchaPayload | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  
  const [encoded, signature] = parts
  
  // Verify signature
  const hmac = crypto.createHmac('sha256', getCaptchaSecret())
  hmac.update(encoded)
  const expectedSignature = hmac.digest('base64url')
  
  if (signature !== expectedSignature) return null
  
  try {
    const data = Buffer.from(encoded, 'base64url').toString('utf-8')
    return JSON.parse(data) as CaptchaPayload
  } catch {
    return null
  }
}

// Generate a simple math captcha
function generateMathCaptcha(): { question: string; answer: string } {
  const operations = ['+', '-', '×']
  const op = operations[Math.floor(Math.random() * operations.length)]
  
  let a: number, b: number, answer: number
  
  switch (op) {
    case '+':
      a = Math.floor(Math.random() * 20) + 1
      b = Math.floor(Math.random() * 20) + 1
      answer = a + b
      break
    case '-':
      a = Math.floor(Math.random() * 20) + 10
      b = Math.floor(Math.random() * 10) + 1
      answer = a - b
      break
    case '×':
      a = Math.floor(Math.random() * 10) + 1
      b = Math.floor(Math.random() * 10) + 1
      answer = a * b
      break
    default:
      a = 5
      b = 3
      answer = 8
  }
  
  return {
    question: `${a} ${op} ${b} = ?`,
    answer: answer.toString()
  }
}

// Generate SVG for the captcha question
function generateCaptchaSvg(text: string): string {
  const width = 200
  const height = 60
  
  // Add some visual noise
  let noise = ''
  for (let i = 0; i < 5; i++) {
    const x1 = Math.random() * width
    const y1 = Math.random() * height
    const x2 = Math.random() * width
    const y2 = Math.random() * height
    noise += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ddd" stroke-width="1"/>`
  }
  
  // Add some dots
  for (let i = 0; i < 30; i++) {
    const cx = Math.random() * width
    const cy = Math.random() * height
    noise += `<circle cx="${cx}" cy="${cy}" r="1" fill="#ccc"/>`
  }
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#f8fafc"/>
    ${noise}
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#1e40af">
      ${text}
    </text>
  </svg>`
}

export interface GeneratedCaptcha {
  token: string
  svg: string
}

export function generateCaptcha(): GeneratedCaptcha {
  const { question, answer } = generateMathCaptcha()

  const payload: CaptchaPayload = {
    answer: answer.toLowerCase(),
    exp: Date.now() + CAPTCHA_EXPIRY_MS
  }

  const token = signCaptcha(payload)
  const svg = generateCaptchaSvg(question)

  return {
    token,
    svg
  }
}

export function validateCaptcha(token: string, userInput: string): { valid: boolean; error?: string } {
  if (!token || !userInput) {
    return { valid: false, error: 'Captcha token and input are required' }
  }

  const payload = verifyCaptcha(token)
  if (!payload) {
    return { valid: false, error: 'Invalid captcha token' }
  }

  if (Date.now() > payload.exp) {
    return { valid: false, error: 'Captcha expired' }
  }

  if (payload.answer !== userInput.toLowerCase().trim()) {
    return { valid: false, error: 'Incorrect captcha' }
  }

  return { valid: true }
}
