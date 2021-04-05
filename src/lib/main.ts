import { Environment, FluxPack } from '@youwol/flux-core'
import {AUTO_GENERATED} from '../auto_generated'


export let pack = new FluxPack(
   AUTO_GENERATED,
   ( environment: Environment ) => {
        return environment.fetchStyleSheets(
            [
                "codemirror#5.52.0~codemirror.min.css",
                "codemirror#5.52.0~theme/eclipse.min.css"
            ]
        )
    }    
)

