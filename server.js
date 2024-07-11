const net = require('net');

const PORT = 3000;

// Mock storage for chat messages, exams, and solutions
let chatMessages = [];
let exams = {};
let solutions = {};

const server = net.createServer((socket) => {
    socket.write('Welcome to the Chat Server!\n');

    let buffer = '';

    socket.on('data', (data) => {
        buffer += data.toString('utf8');

        // Check if the buffer contains one or more complete lines
        let lines = buffer.split('\n');
        buffer = lines.pop(); // Keep the incomplete line in the buffer

        for (let line of lines) {
            line = line.trim();
            const [command, ...args] = line.split(' ');

            switch (command) {
                case 'POST_CHAT':
                    if (args.length < 2) {
                        socket.write('Usage: POST_CHAT <username> <message>\n');
                    } else {
                        const username = args[0];
                        const message = line.slice(command.length + username.length + 2).trim();
                        chatMessages.push(`${username}: ${message}`);
                        socket.write('Message sent successfully\n');
                    }
                    break;
                case 'GET_CHAT':
                    const number = parseInt(line.slice(command.length + 1).trim(), 10);
                    if (isNaN(number)) {
                        socket.write('Invalid number parameter\n');
                    } else {
                        const messages = number > 0 && number <= chatMessages.length
                            ? chatMessages.slice(-number)
                            : chatMessages;
                        socket.write(messages.join('\n') + '\n');
                    }
                    break;
                case 'POST_EXAM':
                    if (args.length < 2) {
                        socket.write('Usage: POST_EXAM <number> <content>\n');
                    } else {
                        const examNumber = args[0];
                        const content = line.slice(command.length + examNumber.length + 2).trim();
                        exams[examNumber] = content;
                        socket.write(`Exam ${examNumber} content saved\n`);
                    }
                    break;
                case 'GET_EXAM':
                    const examNumber = line.slice(command.length + 1).trim();
                    const exam = exams[examNumber];
                    if (exam) {
                        socket.write(exam + '\n');
                    } else {
                        socket.write(`Exam ${examNumber} not found\n`);
                    }
                    break;
                case 'POST_SOLUTION':
                    if (args.length < 2) {
                        socket.write('Usage: POST_SOLUTION <number> <solution>\n');
                    } else {
                        const solutionNumber = args[0];
                        const solution = line.slice(command.length + solutionNumber.length + 2).trim();
                        solutions[solutionNumber] = solution;
                        socket.write(`Solution for exam ${solutionNumber} saved\n`);
                    }
                    break;
                case 'GET_SOLUTION':
                    const solutionNum = line.slice(command.length + 1).trim();
                    const solution = solutions[solutionNum];
                    if (solution) {
                        socket.write(solution + '\n');
                    } else {
                        socket.write(`Solution for exam ${solutionNum} not found\n`);
                    }
                    break;
                case 'RESET':
                    chatMessages = [];
                    exams = {};
                    solutions = {};
                    socket.write('All data has been reset\n');
                    break;
                default:
                    socket.write('Unknown command\n');
            }
        }
    });

    socket.on('end', () => {
        socket.write('Goodbye!\n');
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
