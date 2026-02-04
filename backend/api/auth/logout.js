const TOKEN_NAME = 'token';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  // Clear cookie
  const cookie = `${TOKEN_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
  res.setHeader('Set-Cookie', cookie);
  return res.status(200).json({ message: 'Logged out' });
};
