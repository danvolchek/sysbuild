import ko from 'knockout';
import templateMarkup from 'text!./test-status-tab.html';
import * as SysGlobalObservables from 'app/sys-global-observables';

class TestStatusTab {
    constructor() {
        this.testStatus = ko.observable('Not Yet Executed - Click \'Run It\' in the Code tab!');
        this.executed = ko.observable(false);
        this.exitCode = SysGlobalObservables.lastProgramExitCode;

        this.tests = ko.observableArray([
            new this.Test('Output is exactly \'Hello World!\'', /Hello World!/, null, null),
            new this.Test('Exit Code is 0', null, { exitVal: 0, checkType: 'equals' }, null)
        ]);


        SysGlobalObservables.lastProgramOutput.subscribe((newValue) => {
            this.testStatus('Executed!');
            this.executed(true);
            this.checkTests(newValue, this.exitCode());
        });
    }

    Test(name, outputRe, exitCode) {
        this.name = name;
        this.status = ko.observable(null);
        this.status_readable = ko.pureComputed(() => {
            if (this.status() == null) {
                return '?';
            }

            return this.status() ? 'Passed!' : 'Failed!';
        }, this);

        this.status_color = ko.pureComputed(() => {
            if (this.status() == null) {
                return 'yellow';
            }

            return this.status() ? 'green' : 'red';
        }, this);

        this.outputRe = outputRe;
        this.exitCode = exitCode;
    }

    checkTests(programOutput, programExitCode) {
        ko.utils.arrayForEach(this.tests(), (test) => {
            let passed = true;

            if (test.outputRe !== null && !test.outputRe.test(programOutput)) {
                passed = false;
            }

            if (test.exitCode !== null) {
                if (test.exitCode.checkType === 'equals') {
                    if (programExitCode !== test.exitCode.exitVal) {
                        passed = false;
                    }
                } else if (test.exitCode.checkType === 'not equals') {
                    if (programExitCode === test.exitCode.exitVal) {
                        passed = false;
                    }
                }
            }
            test.status(passed);
        });
    }

    dispose() {
        // This runs when the component is torn down. Put here any logic necessary to clean up,
        // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
    }
}


export default { viewModel: TestStatusTab, template: templateMarkup };
