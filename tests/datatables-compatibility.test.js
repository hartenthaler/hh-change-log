const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('resources/js/hh-change-log.js', 'utf8');

function createTable() {
    return {
        classList: {remove() {}},
        dataset: {
            ajax: '/changes',
            from: '2026-01-01',
            gedcomDetailsLabel: 'GEDCOM details',
            gedcomExpanded: 'false',
            maximumNumber: '15',
            xref: 'I1',
        },
        querySelectorAll() {
            return [];
        },
    };
}

function run(version) {
    const table = createTable();
    let options;

    const DataTable = function (element, suppliedOptions) {
        assert.equal(element, table);
        options = suppliedOptions;
    };
    DataTable.versionCheck = () => version === 2;

    const jQuery = function (element) {
        assert.equal(element, table);

        return {
            DataTable(suppliedOptions) {
                options = suppliedOptions;
            },
        };
    };
    jQuery.fn = {DataTable() {}};

    const window = {
        DataTable,
        addEventListener() {},
        jQuery: version === 1 ? jQuery : undefined,
    };
    const document = {
        querySelector() {
            return table;
        },
    };

    vm.runInNewContext(source, {document, window});

    assert.ok(options, `DataTables ${version} was not initialized`);
    assert.equal(options.ajax.type, 'POST');

    const request = {length: 25, start: 10};
    options.ajax.data(request);
    assert.equal(request.from, '2026-01-01');
    assert.equal(request.xref, 'I1');
    assert.equal(request.length, 5);

    const response = {data: [1, 2, 3, 4, 5, 6], recordsFiltered: 50, recordsTotal: 60};
    assert.deepEqual(Array.from(options.ajax.dataSrc(response)), [1, 2, 3, 4, 5]);
    assert.equal(response.recordsFiltered, 15);
    assert.equal(response.recordsTotal, 15);
}

run(1);
run(2);

console.log('DataTables 1/2 compatibility tests passed.');
