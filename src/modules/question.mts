import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

class Question {
  async make(question: string): Promise<string> {
    const rl = readline.createInterface({ input, output });
    const answer = await rl.question(question);

    rl.close();
    return answer;
  }
}

const question = new Question();

export { question };
