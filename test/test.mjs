import { MonoJustifier } from '../out/justifier.mjs';
import * as fs           from 'fs';
import * as path         from 'path';

// ─── Line ──────────────────────────────────────────────────────────────── ✣ ─

function printLine() {
    console.log('──────────────────────────────────────────────────');
}

// ─── Getting Cases ─────────────────────────────────────────────────────── ✣ ─

function* getTestCases() {
    const testCasesDirectoryPath = path.join(process.cwd(), 'test', 'cases');
    const testCaseFileNames      = fs.readdirSync(testCasesDirectoryPath);

    for (const fileName of testCaseFileNames) {
        const testCasePath        = path.join(testCasesDirectoryPath, fileName);
        const testCaseFileContent = fs.readFileSync(testCasePath, 'utf-8');
        const partsOfTheCase      = testCaseFileContent.split('---');

        yield {
            name:     fileName,
            given:    partsOfTheCase[0].trim(),
            expected: partsOfTheCase[1].trim(),
        }
    }
}

// ─── Testing A Case ────────────────────────────────────────────────────── ✣ ─

function testCase(testingCase) {
    const justifier = new MonoJustifier({
        maxLineSize: 42 // because...
    });

    const result = justifier.justifyText(testingCase.given);

    printLine();
    console.log('Testing', testingCase.name);

    if (result == testingCase.expected) {
        console.log('Successful');
        return true;
    }
    else {
        console.log(`Failed! Expected:\n${testingCase.expected}`);
        console.log(`\n\nGot:\n${result}`);
        return false;
    }
}

// ─── Main ──────────────────────────────────────────────────────────────── ✣ ─

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

    console.log('\n');
    printLine();
    console.log(`${allTestsDone} Tests Done. ${testsPassedSuccessfully} Successful, ${allTestsDone - testsPassedSuccessfully} Failed`);

    const successfulExit = allTestsDone == testsPassedSuccessfully;

    console.log(`Exiting with ${successfulExit ? 'Success' : 'Failure'}`);
    printLine();
    console.log();

    process.exitCode = successfulExit ? 0 : 1;
}