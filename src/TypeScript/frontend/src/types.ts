export interface UserPreferences {
    csvDelimiter: string,
    csvDecimalDelimiter: string,
    localeString: string,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Callback = (param?: any) => void;
