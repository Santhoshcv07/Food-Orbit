const fs = require('fs');
const readline = require('readline');

async function extractPrompt() {
  const fileStream = fs.createReadStream('C:\\Users\\santh\\.gemini\\antigravity-ide\\brain\\4e5fd142-69f3-47db-aac5-e850132254f0\\.system_generated\\logs\\transcript.jsonl');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.type === 'USER_INPUT') {
        fs.writeFileSync('C:\\Users\\santh\\OneDrive\\Desktop\\food-orbit\\master_prompt.txt', parsed.content, 'utf8');
        console.log("Extracted master prompt!");
        break;
      }
    } catch(e) {}
  }
}

extractPrompt();
