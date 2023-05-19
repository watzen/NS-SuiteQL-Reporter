import { DependencyList, useEffect, useState } from 'react'

const useFetch = (
    requestInfo: RequestInfo | string | null,
    dependencies: DependencyList | false = false
): { data: unknown, loading: boolean, doRequest: (options: Request | RequestInfo | null) => void }  => {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<undefined>(undefined)

    const doRequest = (options: Request | RequestInfo | null): void => {
        if (options === undefined || options === null) {
            return
        }
        setLoading(true)
        const url = typeof options === 'string' ? options : options.url
        const init = typeof options === 'string' ? undefined : options
        fetch(url, init).then((response) =>
            response.json().then((data) => {
                setLoading(false)
                setData(data)
            })
        )
    }
    useEffect(() => {
        if(dependencies) { doRequest(requestInfo) }
    }, dependencies || [])
    return { data, loading, doRequest }
}

export default useFetch
