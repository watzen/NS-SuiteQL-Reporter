// eslint-disable-next-line import/no-unresolved
import * as config from 'N/config'
import { Field } from './user-preferences-constant'

const convertCSVDelimiterToChar = (inputString): string => {
    switch (inputString) {
        case 'COMMA':
            return ','
        case 'SEMICOLON':
            return ';'
        case 'PIPE':
            return '|'
        case 'SPACE':
            return ' '
        case 'TAB':
            return '\t'
        case 'PERIOD':
            return '.'
        default:
            return ','
    }
}

const convertNSNumberFormatIdToLocale = (inputIdString): string => {
    switch (inputIdString) {
        case '1':
            return 'de-DE'
        case '3':
            return 'fr-FR'
        default:
            return 'en-EN'
    }
}

type GetUserPreferencesReturn = {
    csvDelimiter: string,
    csvDecimalDelimiter: string,
    localeString: string,
}
export const getUserPreferences = ():GetUserPreferencesReturn => {

    const userPreferences = config.load({ type: config.Type.USER_PREFERENCES })
    return {
        csvDelimiter: convertCSVDelimiterToChar(userPreferences.getValue(Field.CSV_COLUMN_DELIMITER)),
        csvDecimalDelimiter: convertCSVDelimiterToChar(userPreferences.getValue(Field.CSV_DECIMAL_DELIMITER)),
        localeString: convertNSNumberFormatIdToLocale(userPreferences.getValue(Field.NUMBERFORMAT)),
    }

}
