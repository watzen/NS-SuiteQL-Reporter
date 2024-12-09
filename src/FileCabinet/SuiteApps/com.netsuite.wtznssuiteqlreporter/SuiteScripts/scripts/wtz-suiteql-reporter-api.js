/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(["N/config","N/error","N/https","N/log","N/query","N/record"], (__WEBPACK_EXTERNAL_MODULE_N_config__, __WEBPACK_EXTERNAL_MODULE_N_error__, __WEBPACK_EXTERNAL_MODULE_N_https__, __WEBPACK_EXTERNAL_MODULE_N_log__, __WEBPACK_EXTERNAL_MODULE_N_query__, __WEBPACK_EXTERNAL_MODULE_N_record__) => { return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/TypeScript/frontend/src/constants.ts":
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports], __WEBPACK_AMD_DEFINE_RESULT__ = (function (require, exports) {
    Object.defineProperty(exports, "__esModule", ({ value: true }));
    exports.Resource = void 0;
    var Resource;
    (function (Resource) {
        Resource[Resource["GetColumns"] = 0] = "GetColumns";
        Resource[Resource["RunReport"] = 1] = "RunReport";
        Resource[Resource["UserPreferences"] = 2] = "UserPreferences";
        Resource[Resource["GetVariables"] = 3] = "GetVariables";
    })(Resource = exports.Resource || (exports.Resource = {}));
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

/***/ "./src/TypeScript/scripts/reporter api suitelet/column-getter/index.ts":
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports, __webpack_require__("N/error"), __webpack_require__("N/query")], __WEBPACK_AMD_DEFINE_RESULT__ = (function (require, exports, error, query) {
    Object.defineProperty(exports, "__esModule", ({ value: true }));
    exports.getColumns = void 0;
    const getColumns = (reportId) => {
        if (!reportId) {
            throw error.create({
                name: 'INVALID_REPORT_ID',
                message: `Invalid report id. Received: ${reportId}`,
            });
        }
        return query.runSuiteQL({
            query: `
            SELECT
                RC.${"custrecord_wtz_sql_report_col_id" /* REPORT_COLUMNS.FIELDS.COLUMN_ID */} as id,
                RC.${"custrecord_wtz_sql_report_col_label" /* REPORT_COLUMNS.FIELDS.COLUMN_LABEL */} as label,
                CT.scriptId as type
            FROM
                ${"customrecord_wtz_suiteql_report_columns" /* REPORT_COLUMNS.RECORD.SCRIPTID */} RC
                LEFT JOIN ${"customlist_wtz_sql_report_col_types" /* COLUMN_TYPES.RECORD.SCRIPTID */} CT ON RC.${"custrecord_wtz_sql_report_col_type" /* REPORT_COLUMNS.FIELDS.COLUMN_DATA_TYPE */} = CT.id
            WHERE
                RC.${"custrecord_wtz_sql_report_col_report" /* REPORT_COLUMNS.FIELDS.SUITEQL_REPORT */} = ?
                AND RC.isinactive = 'F'
        `,
            params: [reportId],
        }).asMappedResults();
    };
    exports.getColumns = getColumns;
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),

/***/ "./src/TypeScript/scripts/reporter api suitelet/controller-api.ts":
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports, __webpack_require__("N/log"), __webpack_require__("./src/TypeScript/frontend/src/constants.ts"), __webpack_require__("./src/TypeScript/models/customrecord_wtz_suiteql_report_variable/index.ts"), __webpack_require__("./src/TypeScript/scripts/reporter api suitelet/column-getter/index.ts"), __webpack_require__("./src/TypeScript/scripts/reporter api suitelet/report-generator/index.ts"), __webpack_require__("./src/TypeScript/scripts/reporter api suitelet/user-preferences/index.ts"), __webpack_require__("./src/TypeScript/scripts/reporter api suitelet/utils.ts")], __WEBPACK_AMD_DEFINE_RESULT__ = (function (require, exports, log, constants_1, customrecord_wtz_suiteql_report_variable_1, columnGetterService, reportGeneratorService, user_preferences_1, utils) {
    Object.defineProperty(exports, "__esModule", ({ value: true }));
    exports.get = void 0;
    function get(context) {
        const { resource, reportId, variables, pageNumber } = context.request.parameters;
        const parsedResource = utils.parseResource(resource);
        if (parsedResource === constants_1.Resource.UserPreferences) {
            const userPreferences = user_preferences_1.userPreferenceService.getUserPreferences();
            log.audit('userPreferences', userPreferences);
            context.response.setHeader({ name: 'Content-Type', value: 'application/json' });
            context.response.write(JSON.stringify(userPreferences));
            return;
        }
        if (parsedResource === constants_1.Resource.RunReport && reportId) {
            const reportData = reportGeneratorService.getReportData({
                reportId,
                pageNumber: pageNumber | 0,
                variables: variables ? JSON.parse(variables) : undefined,
            });
            context.response.setHeader({ name: 'Content-Type', value: 'application/json' });
            context.response.write(JSON.stringify(reportData));
            log.audit('reportData', reportData);
            return;
        }
        if (parsedResource === constants_1.Resource.GetColumns && reportId) {
            const columns = columnGetterService.getColumns(reportId);
            context.response.setHeader({ name: 'Content-Type', value: 'application/json' });
            context.response.write(JSON.stringify(columns));
            log.audit('columns', columns);
            return;
        }
        if (parsedResource === constants_1.Resource.GetVariables && reportId) {
            const variables = (0, customrecord_wtz_suiteql_report_variable_1.getVariables)(reportId);
            context.response.setHeader({ name: 'Content-Type', value: 'application/json' });
            context.response.write(JSON.stringify(variables));
            log.audit('variables', variables);
            return;
        }
    }
    exports.get = get;
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),

/***/ "./src/TypeScript/scripts/reporter api suitelet/report-generator/index.ts":
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports, __webpack_require__("N/error"), __webpack_require__("N/query"), __webpack_require__("N/record")], __WEBPACK_AMD_DEFINE_RESULT__ = (function (require, exports, error, query, record) {
    Object.defineProperty(exports, "__esModule", ({ value: true }));
    exports.getReportData = void 0;
    const getReportData = ({ reportId, pageNumber, variables }) => {
        if (!reportId) {
            throw error.create({
                name: 'INVALID_REPORT_ID',
                message: `Invalid report id. Received: ${reportId}`,
            });
        }
        const suiteQlReportRec = record.load({
            type: "customrecord_wtz_suiteql_report" /* SUITEQL_REPORT.RECORD.SCRIPTID */,
            id: (typeof reportId === 'number') ? reportId : parseInt(reportId, 10),
        });
        let suiteQl = suiteQlReportRec.getValue("custrecord_wtz_sql_report_suiteql" /* SUITEQL_REPORT.FIELDS.SUITEQL */);
        Object.entries(variables).forEach(([variableId, variable]) => {
            suiteQl = suiteQl.replace(new RegExp(`{{${variableId}}}`, 'g'), variable.defaultValue);
        });
        const startRow = pageNumber * 5000 + 1;
        const endRow = pageNumber * 5000 + 5000;
        return query.runSuiteQL({
            query: `
        SELECT *
            FROM (
                SELECT
                    ROWNUM AS RN,
                    *
                FROM (
                    ${suiteQl}
                )
            )
            WHERE RN BETWEEN ${startRow} AND ${endRow}
        `,
        }).asMappedResults();
    };
    exports.getReportData = getReportData;
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),

/***/ "./src/TypeScript/scripts/reporter api suitelet/user-preferences/index.ts":
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports, __webpack_require__("./src/TypeScript/scripts/reporter api suitelet/user-preferences/user-preferences-service.ts"), __webpack_require__("./src/TypeScript/scripts/reporter api suitelet/user-preferences/user-preferences-constant.ts")], __WEBPACK_AMD_DEFINE_RESULT__ = (function (require, exports, userPreferenceService, user_preferences_constant_1) {
    Object.defineProperty(exports, "__esModule", ({ value: true }));
    exports.userPreferenceService = exports.constants = void 0;
    exports.userPreferenceService = userPreferenceService;
    Object.defineProperty(exports, "constants", ({ enumerable: true, get: function () { return user_preferences_constant_1.Field; } }));
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),

/***/ "./src/TypeScript/scripts/reporter api suitelet/user-preferences/user-preferences-constant.ts":
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports], __WEBPACK_AMD_DEFINE_RESULT__ = (function (require, exports) {
    Object.defineProperty(exports, "__esModule", ({ value: true }));
    exports.Field = void 0;
    var Field;
    (function (Field) {
        Field["CSV_COLUMN_DELIMITER"] = "CSV_COLUMN_DELIMITER";
        Field["CSV_DECIMAL_DELIMITER"] = "CSV_DECIMAL_DELIMITER";
        Field["NUMBERFORMAT"] = "NUMBERFORMAT";
    })(Field = exports.Field || (exports.Field = {}));
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),

/***/ "./src/TypeScript/scripts/reporter api suitelet/user-preferences/user-preferences-service.ts":
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports, __webpack_require__("N/config"), __webpack_require__("./src/TypeScript/scripts/reporter api suitelet/user-preferences/user-preferences-constant.ts")], __WEBPACK_AMD_DEFINE_RESULT__ = (function (require, exports, config, user_preferences_constant_1) {
    Object.defineProperty(exports, "__esModule", ({ value: true }));
    exports.getUserPreferences = void 0;
    const convertCSVDelimiterToChar = (inputString) => {
        switch (inputString) {
            case 'COMMA':
                return ',';
            case 'SEMICOLON':
                return ';';
            case 'PIPE':
                return '|';
            case 'SPACE':
                return ' ';
            case 'TAB':
                return '\t';
            case 'PERIOD':
                return '.';
            default:
                return ',';
        }
    };
    const convertNSNumberFormatIdToLocale = (inputIdString) => {
        switch (inputIdString) {
            case '1':
                return 'de-DE';
            case '3':
                return 'fr-FR';
            default:
                return 'en-EN';
        }
    };
    const getUserPreferences = () => {
        const userPreferences = config.load({ type: config.Type.USER_PREFERENCES });
        return {
            csvDelimiter: convertCSVDelimiterToChar(userPreferences.getValue(user_preferences_constant_1.Field.CSV_COLUMN_DELIMITER)),
            csvDecimalDelimiter: convertCSVDelimiterToChar(userPreferences.getValue(user_preferences_constant_1.Field.CSV_DECIMAL_DELIMITER)),
            localeString: convertNSNumberFormatIdToLocale(userPreferences.getValue(user_preferences_constant_1.Field.NUMBERFORMAT)),
        };
    };
    exports.getUserPreferences = getUserPreferences;
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),

/***/ "./src/TypeScript/scripts/reporter api suitelet/utils.ts":
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports, __webpack_require__("N/log"), __webpack_require__("./src/TypeScript/frontend/src/constants.ts")], __WEBPACK_AMD_DEFINE_RESULT__ = (function (require, exports, log, constants_1) {
    Object.defineProperty(exports, "__esModule", ({ value: true }));
    exports.parseResource = exports.fromIntegerToFloatNum = exports.fromIntegerToFloat = exports.toInteger = void 0;
    function toInteger(floatNumber, precision = 2) {
        if (typeof floatNumber === 'string') {
            return Math.round(parseFloat(floatNumber) * Math.pow(10, precision));
        }
        return Math.round(floatNumber * Math.pow(10, precision));
    }
    exports.toInteger = toInteger;
    function fromIntegerToFloat(amount) {
        if (typeof amount === 'string') {
            return (parseInt(amount) / 100).toString();
        }
        return (amount / 100).toString();
    }
    exports.fromIntegerToFloat = fromIntegerToFloat;
    function fromIntegerToFloatNum(amount) {
        if (typeof amount === 'string') {
            return (parseInt(amount) / 100);
        }
        return (amount / 100);
    }
    exports.fromIntegerToFloatNum = fromIntegerToFloatNum;
    function parseResource(resource) {
        const parsedResource = parseInt(resource);
        log.debug('Utils.parseResource(resource)', { value: resource, label: constants_1.Resource[resource] });
        if (!Object.values(constants_1.Resource).includes(parsedResource)) {
            throw new Error(`Invalid resource provided. Must be one of ${JSON.stringify(Object.values(constants_1.Resource))}, sent: ${JSON.stringify(resource)}`);
        }
        return parsedResource;
    }
    exports.parseResource = parseResource;
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),

/***/ "./src/TypeScript/scripts/wtz-sl-suiteql-reporter-api.ts":
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports, __webpack_require__("N/https"), __webpack_require__("N/log"), __webpack_require__("./src/TypeScript/scripts/reporter api suitelet/controller-api.ts")], __WEBPACK_AMD_DEFINE_RESULT__ = (function (require, exports, https, log, controller_api_1) {
    Object.defineProperty(exports, "__esModule", ({ value: true }));
    exports.onRequest = void 0;
    function onRequest(context) {
        const eventRouter = {
            [https.Method.GET]: controller_api_1.get,
        };
        if (eventRouter[context.request.method] === undefined) {
            log.error({
                title: 'unsupported request received',
                details: `No handler for route: ${context.request.method}`,
            });
            return;
        }
        try {
            eventRouter[context.request.method](context);
        }
        catch (err) {
            log.error('Failed to handle ' + context.request.method + ' request ' + err.name, err.message);
        }
        log.debug('Suitelet', 'Responded to request');
    }
    exports.onRequest = onRequest;
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),

/***/ "N/config":
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_N_config__;

/***/ }),

/***/ "N/error":
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_N_error__;

/***/ }),

/***/ "N/https":
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_N_https__;

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
/******/ 	var __webpack_exports__ = __webpack_require__("./src/TypeScript/scripts/wtz-sl-suiteql-reporter-api.ts");
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});;