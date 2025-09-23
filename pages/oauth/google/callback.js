import { useSearchParams } from "next/navigation";
import * as dotenv from "dotenv";
import { useEffect, useState } from "react";


export default function CallbackHandler() {

    let [ bodyText , setBodyText ] = useState('Sending you to the right place...');

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

                if( resp.success && resp.data.authtoken ) {

                    setBodyText( "User verified" );

                    localStorage.setItem('AuthToken' , resp.data.authtoken);
                    window.location.replace('/');
                    return;

                } else {
                    setBodyText( resp.error );
                }

            })  
            .catch(e => {
                console.error(e);
            })
    } , [])



    return <h1>{bodyText}</h1>;
}