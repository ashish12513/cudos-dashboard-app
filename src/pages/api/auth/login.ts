import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { serialize } from 'cookie'

// Mock user database - replace with your actual user store
const users = [
  {
    id: 1,
    email: 'ashish.anand@redingtongroup.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    name: 'Ashish Anand',
    department: 'IT'
  }
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' })
  }

  // Find user
  const user = users.find(u => u.email === email)
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  // Generate JWT
  const jwtSecret = process.env.JWT_SECRET || 'vision360-default-secret-key-change-in-production'
  const token = jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      name: user.name,
      department: user.department
    },
    jwtSecret,
    { expiresIn: '24h' }
  )

  // Set HTTP-only cookie
  const cookie = serialize('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 86400, // 24 hours
    path: '/'
  })

  res.setHeader('Set-Cookie', cookie)
  res.status(200).json({ 
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      department: user.department
    }
  })
}