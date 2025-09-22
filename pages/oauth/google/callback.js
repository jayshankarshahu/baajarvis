import { useSearchParams } from "next/navigation";
import * as dotenv from "dotenv";
import { useEffect } from "react";


export default function CallbackHandler() {

    // const searchParams = useSearchParams();

    // adding here so the api doesn't get called multiple times ( this runs only on mount )
    useEffect(() => {                
        
        const searchParams = new URLSearchParams(window.location.search);
                
        let apiCallUrl = new URL('/api/oauth/handle-access-code', process.env.NEXT_PUBLIC_DOMAIN);
                
        for ( const [searchParamKey, value] of searchParams ){            
            apiCallUrl.searchParams.set(searchParamKey, searchParams.get(searchParamKey));
        };

        fetch(apiCallUrl)
            .then(r => r.json())
            .then(resp => {

                console.log(resp);

            })
            .catch(e => {
                console.error(e);
            })
    } , [])



    return <h1>Hii</h1>;
}