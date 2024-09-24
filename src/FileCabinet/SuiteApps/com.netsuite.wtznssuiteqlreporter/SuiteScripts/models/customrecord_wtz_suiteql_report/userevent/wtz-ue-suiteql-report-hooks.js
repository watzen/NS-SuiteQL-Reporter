/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(["N/error","N/file","N/log","N/query","N/record","N/runtime","N/ui/serverWidget"], (__WEBPACK_EXTERNAL_MODULE_N_error__, __WEBPACK_EXTERNAL_MODULE_N_file__, __WEBPACK_EXTERNAL_MODULE_N_log__, __WEBPACK_EXTERNAL_MODULE_N_query__, __WEBPACK_EXTERNAL_MODULE_N_record__, __WEBPACK_EXTERNAL_MODULE_N_runtime__, __WEBPACK_EXTERNAL_MODULE_N_ui_serverWidget__) => { return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/TypeScript/models/customrecord_wtz_suiteql_report/userevent/hooks/addSuiteQLResults.ts":
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports, __webpack_require__("N/file"), __webpack_require__("N/log"), __webpack_require__("N/runtime"), __webpack_require__("N/ui/serverWidget")], __WEBPACK_AMD_DEFINE_RESULT__ = (function (require, exports, file, log, runtime, serverWidget) {
    Object.defineProperty(exports, "__esModule", ({ value: true }));
    exports.addSuiteQLResults = void 0;
    const addSuiteQLResults = (context) => {
        const { newRecord, form, type } = context;
        log.audit('runSuiteQL start', {
            recordId: newRecord.id,
            contextType: type,
            executionContext: runtime.executionContext,
        });
        if (runtime.executionContext !== runtime.ContextType.USER_INTERFACE
            || type !== context.UserEventType.VIEW) {
            return;
        }
        form.addField({ id: 'custpage_react_app', label: 'Report React App', type: serverWidget.FieldType.INLINEHTML })
            .defaultValue = getReactApp().fileContents;
        function getReactApp() {
            const fileLoadOptions = './index.html';
            return { fileContents: file.load(fileLoadOptions).getContents() };
        }
    };
    exports.addSuiteQLResults = addSuiteQLResults;
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),

/***/ "./src/TypeScript/models/customrecord_wtz_suiteql_report/userevent/hooks/hideAllFields.ts":
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports, __webpack_require__("N/log"), __webpack_require__("N/runtime"), __webpack_require__("N/ui/serverWidget")], __WEBPACK_AMD_DEFINE_RESULT__ = (function (require, exports, log, runtime, serverWidget) {
    Object.defineProperty(exports, "__esModule", ({ value: true }));
    exports.hideAllFields = void 0;
    const hideAllFields = (context) => {
        const { newRecord, form, type } = context;
        log.audit('hideAllFields start', {
            recordId: newRecord.id,
            contextType: type,
            executionContext: runtime.executionContext,
        });
        if (runtime.executionContext !== runtime.ContextType.USER_INTERFACE
            || type !== context.UserEventType.VIEW) {
            return;
        }
        const fieldsNotToHide = [
            'linenumber',
            'nlloc',
            'nlsub',
            'rectype',
            '_eml_nkey_',
            'type',
            'nameorig',
            'nsapiCT',
            'sys_id',
            'nluser',
            'nldept',
            'entryformquerystring',
            'nlrole',
            '_csrf',
            'baserecordtype',
            'ownerid',
            'version',
            'submitnext_y',
            'submitnext_t',
        ];
        const fields = newRecord.getFields();
        log.audit('hideAllFields', { fields });
        fields.filter(field => (!fieldsNotToHide.includes(field))).forEach(id => {
            var _a;
            (_a = form.getField({ id })) === null || _a === void 0 ? void 0 : _a.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
        });
        newRecord.getSublists().forEach(id => form.getSublist({ id }).displayType = serverWidget.SublistDisplayType.HIDDEN);
    };
    exports.hideAllFields = hideAllFields;
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),

/***/ "./src/TypeScript/models/customrecord_wtz_suiteql_report/userevent/hooks/upsertReportColumns.ts":
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports, __webpack_require__("N/log"), __webpack_require__("N/query"), __webpack_require__("N/record"), __webpack_require__("N/runtime"), __webpack_require__("./src/TypeScript/models/customrecord_wtz_suiteql_report_variable/index.ts")], __WEBPACK_AMD_DEFINE_RESULT__ = (function (require, exports, log, query, record, runtime, customrecord_wtz_suiteql_report_variable_1) {
    Object.defineProperty(exports, "__esModule", ({ value: true }));
    exports.upsertReportColumns = void 0;
    const upsertReportColumns = (context) => {
        const { newRecord, type } = context;
        log.audit('hideAllFields start', {
            recordId: newRecord.id,
            contextType: type,
            executionContext: runtime.executionContext,
        });
        if (type === context.UserEventType.DELETE) {
            deleteAllOrphanColumns();
            return;
        }
        const existingColumns = getExistingColumns(newRecord.id);
        log.debug('upsertReportColumns', { existingColumns });
        const newReportColumns = getNewReportColumns(newRecord);
        log.debug('upsertReportColumns', { newReportColumns });
        reactivateExistingColumns({ existingColumns, newReportColumns });
        inactivateRemovedColumns({ existingColumns, newReportColumns });
        addMissingColumns({ existingColumns, newReportColumns, recordId: newRecord.id });
    };
    exports.upsertReportColumns = upsertReportColumns;
    const getExistingColumns = (recordId) => {
        const columnQueryResults = query.runSuiteQL({
            query: `
            SELECT
                id,
                ${"custrecord_wtz_sql_report_col_id" /* REPORT_COLUMNS.FIELDS.COLUMN_ID */} as column_id
                ,isinactive
            FROM
                ${"customrecord_wtz_suiteql_report_columns" /* REPORT_COLUMNS.RECORD.SCRIPTID */}
            WHERE
                ${"custrecord_wtz_sql_report_col_report" /* REPORT_COLUMNS.FIELDS.SUITEQL_REPORT */} = ?
        `,
            params: [recordId],
        }).asMappedResults();
        return columnQueryResults.map(result => ({
            id: result.id,
            columnId: result.column_id,
            isinactive: result.isinactive === 'T',
        }));
    };
    const getNewReportColumns = (newRecord) => {
        let suiteQL = newRecord.getValue("custrecord_wtz_sql_report_suiteql" /* SUITEQL_REPORT.FIELDS.SUITEQL */);
        const variables = (0, customrecord_wtz_suiteql_report_variable_1.getVariables)(newRecord.id);
        Object.entries(variables).forEach(([variableId, variable]) => {
            suiteQL = suiteQL.replace(new RegExp(`{{${variableId}}}`, 'g'), variable.defaultValue);
        });
        const columns = Object.keys(query.runSuiteQL({
            query: suiteQL,
        }).asMappedResults()[0]);
        const columnsWithSampleValue = query.runSuiteQL({
            query: `
            SELECT
                ${columns.map(columnName => `MAX(${columnName}) as ${columnName}`).join(',')}
            FROM
                (${suiteQL})
        `,
        }).asMappedResults()[0];
        return Object.entries(columnsWithSampleValue).map(([columnId, sampleValue]) => ({
            columnId: columnId.replace(/ /g, '_'),
            sampleValue,
        }));
    };
    const reactivateExistingColumns = ({ existingColumns, newReportColumns }) => {
        try {
            const inactiveExistingColumns = existingColumns.filter(column => {
                return column.isinactive && newReportColumns.some(existingColumn => existingColumn.columnId === column.columnId);
            });
            inactiveExistingColumns.forEach(column => {
                record.submitFields({
                    id: column.id,
                    type: "customrecord_wtz_suiteql_report_columns" /* REPORT_COLUMNS.RECORD.SCRIPTID */,
                    values: {
                        isinactive: false,
                    },
                });
            });
        }
        catch (e) {
            log.error('reactivateExistingColumns', { existingColumns, newReportColumns });
            throw e;
        }
    };
    const inactivateRemovedColumns = ({ existingColumns, newReportColumns }) => {
        try {
            const activeExistingColumns = existingColumns.filter(column => {
                return !column.isinactive && !newReportColumns.some(existingColumn => existingColumn.columnId === column.columnId);
            });
            activeExistingColumns.forEach(column => {
                record.submitFields({
                    id: column.id,
                    type: "customrecord_wtz_suiteql_report_columns" /* REPORT_COLUMNS.RECORD.SCRIPTID */,
                    values: {
                        isinactive: true,
                    },
                });
            });
        }
        catch (e) {
            log.error('inactivateRemovedColumns', { existingColumns, newReportColumns });
            throw e;
        }
    };
    const addMissingColumns = ({ existingColumns, newReportColumns, recordId }) => {
        try {
            const missingColumns = newReportColumns.filter(newReportColumn => {
                return !existingColumns.some(existingColumn => existingColumn.columnId === newReportColumn.columnId);
            });
            missingColumns.forEach(column => {
                const newColumn = record.create({
                    type: "customrecord_wtz_suiteql_report_columns" /* REPORT_COLUMNS.RECORD.SCRIPTID */,
                });
                const valuesToSet = {
                    ["custrecord_wtz_sql_report_col_id" /* REPORT_COLUMNS.FIELDS.COLUMN_ID */]: column.columnId,
                    ["custrecord_wtz_sql_report_col_label" /* REPORT_COLUMNS.FIELDS.COLUMN_LABEL */]: column.columnId.replace(/_/g, ' '),
                    ["custrecord_wtz_sql_report_col_report" /* REPORT_COLUMNS.FIELDS.SUITEQL_REPORT */]: recordId,
                    ["custrecord_wtz_sql_report_col_type" /* REPORT_COLUMNS.FIELDS.COLUMN_DATA_TYPE */]: getDataTypeIdFromSampleValue({ sampleValue: column.sampleValue }),
                };
                Object.entries(valuesToSet).forEach(([fieldId, value]) => {
                    newColumn.setValue({ fieldId, value });
                });
                newColumn.save();
            });
        }
        catch (e) {
            log.error('addMissingColumns', { existingColumns, newReportColumns });
            throw e;
        }
    };
    const getDataTypeIdFromSampleValue = ({ sampleValue }) => {
        let returnType = 'TEXT';
        if (Object.prototype.toString.call(sampleValue) === '[object Date]') {
            returnType = 'DATE';
        }
        if (typeof sampleValue === 'number' || (typeof sampleValue === 'string' && !Number.isNaN(Number(sampleValue)))) {
            const numberValue = Number(sampleValue);
            if (numberValue % 1 !== 0) {
                returnType = 'CURRENCY';
            }
            else {
                returnType = 'INTEGER';
            }
        }
        return getColumnTypeIdFromScriptId(returnType);
    };
    const getColumnTypeIdFromScriptId = (columnTypeScriptId) => {
        return query.runSuiteQL({
            query: `
            SELECT id
            FROM ${"customlist_wtz_sql_report_col_types" /* COLUMN_TYPES.RECORD.SCRIPTID */}
            WHERE scriptid = ?
        `,
            params: [columnTypeScriptId],
        }).asMappedResults()[0].id;
    };
    const deleteAllOrphanColumns = () => {
        query.runSuiteQL({
            query: `
            SELECT id
            FROM ${"customrecord_wtz_suiteql_report_columns" /* REPORT_COLUMNS.RECORD.SCRIPTID */}
            WHERE ${"custrecord_wtz_sql_report_col_report" /* REPORT_COLUMNS.FIELDS.SUITEQL_REPORT */} is null
            `,
        }).asMappedResults().forEach(result => {
            record.delete({
                type: "customrecord_wtz_suiteql_report_columns" /* REPORT_COLUMNS.RECORD.SCRIPTID */,
                id: result.id,
            });
        });
    };
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),

/***/ "./src/TypeScript/models/customrecord_wtz_suiteql_report/userevent/wtz-ue-suiteql-report-hooks.ts":
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports, __webpack_require__("./src/TypeScript/models/customrecord_wtz_suiteql_report/userevent/hooks/hideAllFields.ts"), __webpack_require__("./src/TypeScript/models/customrecord_wtz_suiteql_report/userevent/hooks/addSuiteQLResults.ts"), __webpack_require__("./src/TypeScript/models/customrecord_wtz_suiteql_report/userevent/hooks/upsertReportColumns.ts")], __WEBPACK_AMD_DEFINE_RESULT__ = (function (require, exports, hideAllFields_1, addSuiteQLResults_1, upsertReportColumns_1) {
    Object.defineProperty(exports, "__esModule", ({ value: true }));
    exports.afterSubmit = exports.beforeLoad = void 0;
    const beforeLoadHooks = [
        hideAllFields_1.hideAllFields,
        addSuiteQLResults_1.addSuiteQLResults,
    ];
    const afterSubmitHooks = [
        upsertReportColumns_1.upsertReportColumns,
    ];
    const beforeLoad = (context) => beforeLoadHooks.forEach(hook => hook(context));
    exports.beforeLoad = beforeLoad;
    const afterSubmit = (context) => afterSubmitHooks.forEach(hook => hook(context));
    exports.afterSubmit = afterSubmit;
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),

/***/ "./src/TypeScript/models/customrecord_wtz_suiteql_report_variable/index.ts":
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports, __webpack_require__("N/error"), __webpack_require__("N/query")], __WEBPACK_AMD_DEFINE_RESULT__ = (function (require, exports, error, query) {
    Object.defineProperty(exports, "__esModule", ({ value: true }));
    exports.getVariables = void 0;
    const getVariables = (reportId) => {
        if (!reportId) {
            throw error.create({
                name: 'INVALID_REPORT_ID',
                message: `Invalid report id. Received: ${reportId}`,
            });
        }
        const variables = query.runSuiteQL({
            query: `
            SELECT
                RV.${"custrecord_wtz_sql_report_var_id" /* REPORT_VARIABLES.FIELDS.VARIABLE_ID */} as variable_id
                ,CT.scriptId as type
                ,RV.${"custrecord_wtz_sql_report_var_label" /* REPORT_VARIABLES.FIELDS.VARIABLE_LABEL */} as label
                ,RV.${"custrecord_wtz_sql_report_var_def" /* REPORT_VARIABLES.FIELDS.VARIABLE_DEFAULT_SQL */} as default_value
            FROM
                ${"customrecord_wtz_suiteql_report_variable" /* REPORT_VARIABLES.RECORD.SCRIPTID */} RV
                LEFT JOIN ${"customlist_wtz_sql_report_col_types" /* COLUMN_TYPES.RECORD.SCRIPTID */} CT ON RV.${"custrecord_wtz_sql_report_var_type" /* REPORT_VARIABLES.FIELDS.VARIABLE_DATA_TYPE */} = CT.id
            WHERE
                ${"custrecord_wtz_sql_report_var_report" /* REPORT_VARIABLES.FIELDS.SUITEQL_REPORT */} = ?
        `,
            params: [reportId],
        }).asMappedResults();
        return variables.reduce((acc, variable) => {
            acc[variable.variable_id] = {
                type: variable.type,
                label: variable.label,
                defaultValue: query.runSuiteQL({
                    query: `
                    SELECT
                        ${variable.type === 'DATE' ? 'to_char(' : ''}${variable.default_value}${variable.type === 'DATE' ? `, 'YYYY-MM-DD')` : ''} as default_value
                    FROM DUAL`,
                }).asMappedResults()[0].default_value,
            };
            return acc;
        }, {});
    };
    exports.getVariables = getVariables;
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),

/***/ "N/error":
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_N_error__;

/***/ }),

/***/ "N/file":
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_N_file__;

/***/ }),

/***/ "N/log":
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_N_log__;

/***/ }),

/***/ "N/query":
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_N_query__;

/***/ }),

/***/ "N/record":
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_N_record__;

/***/ }),

/***/ "N/runtime":
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_N_runtime__;

/***/ }),

/***/ "N/ui/serverWidget":
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_N_ui_serverWidget__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module used 'module' so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/TypeScript/models/customrecord_wtz_suiteql_report/userevent/wtz-ue-suiteql-report-hooks.ts");
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});;