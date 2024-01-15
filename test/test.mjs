import { MonoJustifier } from '../out/justifier.mjs';
import * as fs           from 'fs';
import * as path         from 'path';

function* getTestCases() {
    const testCasesDirectoryPath = path.join(process.cwd(), 'test', 'cases');
    const testCaseFileNames      = fs.readdirSync(testCasesDirectoryPath);

    for (const fileName of testCaseFileNames) {
        const testCasePath        = path.join(testCasesDirectoryPath, fileName);
        const testCaseFileContent = fs.readFileSync(testCasePath, 'utf-8');
        const partsOfTheCase      = testCaseFileContent.split('---');

        yield {
            given:    partsOfTheCase[0].trim(),
            expected: partsOfTheCase[1].trim(),
        }
    }
}

function testCase(testingCase) {
    const justifier = new MonoJustifier({
        maxLineSize: 42 // because...
    });

    const result = justifier.justifyText(testingCase.given);

    if (result == testingCase.expected) {
        return true;
    }
    else {
        console.log('--------------------------------------------');
        console.log(`Failed! Expected:\n${testingCase.expected}`);
        console.log(`\n\nGot:\n${result}`);
        return false;
    }
}

main(); function main() {
    let allTestsDone            = 0;
    let testsPassedSuccessfully = 0;

    for (const testingCase of getTestCases()) {
        const success = testCase(testingCase);

        allTestsDone++;
        if (success) {
            testsPassedSuccessfully++;
        }
    }

    console.log('--------------------------------------------');
    console.log(`${allTestsDone} Tests Done. ${testsPassedSuccessfully} Successful, ${allTestsDone - testsPassedSuccessfully} Failed`);

    const successfulExit = allTestsDone == testsPassedSuccessfully;

    console.log(`Exiting with ${successfulExit ? 'Success' : 'Failure'}`);
    console.log('--------------------------------------------\n');

    process.exitCode = successfulExit ? 0 : 1;
}