export default async function handler(req, res) {
  if (req.method === 'POST') {
      // Handle token removal 
      res.status(200).json({ message: "Logout successful" });
  } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
