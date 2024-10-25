import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { language, code } = req.body;


  try {
    const output = await runCodeInDocker(language, code);
    return res.status(200).json({ output });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function runCodeInDocker(language, code) {
    return stdout;
  }
  
