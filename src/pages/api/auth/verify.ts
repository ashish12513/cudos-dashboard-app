import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { parse } from 'cookie'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const cookies = parse(req.headers.cookie || '')
  const token = cookies['auth-token']

  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    res.status(200).json({ user: decoded })
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' })
  }
}