
import { BehaviorSubject } from 'rxjs';
import { render, VirtualDOM } from '@youwol/flux-view'
import {Property, Flux,BuilderView, RenderView, ModuleFlux, Pipe, Schema, contract } from "@youwol/flux-core"
import * as CodeMirror from 'codemirror'
import * as rxjs from 'rxjs'
import { pack } from './main';
import { map, switchMap } from 'rxjs/operators';

//Icons made by <a href="https://www.flaticon.com/authors/alfredo-hernandez" title="Alfredo Hernandez">Alfredo Hernandez</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
let svgIcon = `
<polygon style="fill:#E2E2E2;" points="338.856,0 445.88,107.024 445.88,512 59.24,512 59.24,0 "/>
<polygon style="fill:#999999;" points="445.88,107.024 338.84,107.024 338.84,0 "/>
<polygon style="fill:#333333;" points="407.528,422.896 22.04,422.896 22.04,293.008 489.96,293.008 "/>
<polygon style="fill:#999999;" points="59.24,460.08 59.24,422.896 22.04,422.896 "/>
<g>
	<path style="fill:#FFFFFF;" d="M228.216,320.8v51.536c0,9.584-1.584,15.936-4.752,19.072s-9.632,4.704-19.36,4.704   c-10.352,0-17.072-1.52-20.16-4.528c-3.072-3.024-4.624-9.664-4.624-19.856l0.176-5.52H193c0.224,2.768,0.336,4.848,0.336,6.224   c0,1.312,0.064,2.912,0.176,4.768c0.224,4.512,3.808,6.784,10.768,6.784c4.16,0,6.832-0.816,8.016-2.432   c1.184-1.616,1.776-5.264,1.776-10.96V320.8H228.216z"/>
	<path style="fill:#FFFFFF;" d="M296.744,342.576h-13.84c-0.064-0.704-0.112-1.216-0.112-1.536   c-0.336-4.208-1.248-6.832-2.784-7.904s-5.136-1.632-10.832-1.632c-6.72,0-11.088,0.624-13.152,1.872   c-2.064,1.232-3.088,3.84-3.088,7.808c0,4.704,0.848,7.536,2.512,8.464c1.68,0.96,7.216,1.68,16.624,2.192   c11.12,0.624,18.32,2.224,21.584,4.768s4.896,7.856,4.896,15.92c0,9.904-1.904,16.32-5.728,19.216s-12.272,4.336-25.328,4.336   c-11.728,0-19.536-1.424-23.376-4.272s-5.76-8.608-5.76-17.28l-0.064-2.736h13.776l0.064,1.6c0,5.2,0.912,8.384,2.736,9.568   c1.808,1.168,6.8,1.744,14.928,1.744c6.336,0,10.384-0.672,12.144-2.032c1.744-1.344,2.624-4.448,2.624-9.344   c0-3.616-0.656-6-2-7.184c-1.328-1.184-4.192-1.904-8.608-2.16l-7.84-0.464c-11.808-0.688-19.36-2.336-22.64-4.928   s-4.928-8.144-4.928-16.672c0-8.72,1.968-14.528,5.92-17.424c3.968-2.912,11.856-4.352,23.712-4.352c11.216,0,18.8,1.344,22.688,4   c3.904,2.656,5.856,7.856,5.856,15.6v2.832H296.744z"/>
</g>
`



/**
 * ## Abstract
 * 
 * The code editor module allows to edit text-based file with syntax highlightings - 
 * used mostly for editing source code with different languages.
 * 
 * It is based on the [code mirror](https://codemirror.net/) library.
 * 
 * Documentation about the logic part as well as the inputs/outputs is included [[ModuleEditor.Module | here]].
 * 
 * The configuration of the module is described [[ModuleEditor.PersistentData|here]]
 */
export namespace ModuleEditor {

    export let defaultContent = `
/* This is the default content of the CodeMirror editor.
You can change it either:
     * by updating (statically) the 'content' property 
of the module's configuration.
     * by updating (dynamically) the 'content' property 
of the module's configuration using an adaptor.
*/
function foo(){
    return 'foo'
}
`

    /**
     * Available modes
     */
    enum Mode{
        /**
         * No syntax highlighting
         */
        NONE = 'none',
        /**
         * Javascript syntax highlighting
         */
        JAVASCRIPT = 'javascript',
        /**
         * Python syntax highlighting
         */
        PYTHON = 'python',
        /**
         * HTML mixed syntax highlighting
         */
        HTML = 'html',
        /**
         * CSS syntax highlighting
         */
        CSS = 'css',        
        /**
         * XML syntax highlighting
         */
        XML = 'xml'
    }

    /**
     * Available themes
     */
    enum Theme{
        /**
         * Eclipse theme
         */
        ECLIPSE = 'eclipse',
        /**
         * blackboard theme
         */
        BLACKBOARD = 'blackboard',
         /**
         * Cobalt theme
         */
        COBALT = 'cobalt'
    }

    /*
    The configuration of the editor module allows to tune the rendering of the displayed content.
    */
    @Schema({
        pack: pack
    })
    export class PersistentData {

        /**
         * The text content to display in the editor
         */
        @Property({ 
            description: "The content displayed in the editor.",
            type: 'code'
        })
        readonly content: string

        /**
         *  The mode attribute specify the rules used by the editor for syntax highlighting.
         */
        @Property({ 
            description: "Specify the editor's language for syntax highlighting." ,
            enum: Object.values(Mode) })
        readonly mode: Mode

        /**
         * The theme used by the editor, you can check [here](https://codemirror.net/demo/theme.html); 
         * only a subset of the all CodeMirror's themes are available.
         */
        @Property({ 
            description: "Specify the theme.",
            enum: Object.values(Theme) 
        })
        readonly theme: Theme

        /**
         * This property specify whether or not to display line numbers in the editor.
         */
        @Property({ 
            description: "Whether to show line numbers to the left of the editor",
        })
        readonly lineNumbers: boolean


        /**
         * Convert this configuration into to the one accepted by the Code Mirror editor
         * 
         * @returns the configuration for the code mirror editor
         */
        toCodeMirror() : ConfigCodeMirror {

            return new ConfigCodeMirror({
                value: this.content,
                mode: this.mode,
                theme: this.theme,
                lineNumbers: this.lineNumbers
            })
        }

        constructor({content, mode, theme, lineNumbers}:
                    {content?:string, mode?:Mode, theme?:Theme,lineNumbers?:boolean} = {}){

            this.content        = content           || defaultContent
            this.mode           = mode              || Mode.JAVASCRIPT
            this.theme          = theme             || Theme.ECLIPSE
            this.lineNumbers    = lineNumbers       || true
        }
    }

    let cssResourcesName = {
        "html" : "htmlmixed",
        "javascript":"javascript",
        "css":"css",
        "python":"python",
        "xml":"xml",
    }

    /**
     * This namespace includes helper functions that are accessible 
     * when writing an adaptor.
     */
    export namespace helpers{

        /**
         * The default rules used for mapping the extension to the mode is :
         * ```ts
         * {
                '.ts': 'javascript',
                '.js': 'javascript',
                '.html': 'html',
                '.xml': 'xml',
                '.css': 'css',
                '.py': 'python',
            }
         * ```
         * @param filename the name of the file
         * @param customRules user defined additional rules to use (may override default ones)
         * @returns the corresponding mode with repect to the file extension, or 'none' if no correspondance found   
         */
        export function getModeFromExtension( filename, customRules: {[key:string]: string} = {}) : string{
            let autoExtensionMap = {
                ...{
                '.ts': 'javascript',
                '.js': 'javascript',
                '.html': 'html',
                '.xml': 'xml',
                '.css': 'css',
                '.py': 'python',
            }, ... customRules}
            let mode = filename.split('.').slice(-1)[0]
            return mode && autoExtensionMap[`.${mode}`] ? autoExtensionMap[`.${mode}`] : undefined
        }
    }
    
    /**
    The output data of the module.
    */
    export class OutputData{

        /**
         * The edited content
         */
        public readonly content: string

        /**
         * A function that return whether or not the content has been modified 
         * with respect to the original one.
         */
        public readonly isModified: () => boolean

        constructor({ content, isModified} : 
            {content: string, isModified: () => boolean}){

                this.content = content
                this.isModified = isModified
            }
    }


    export class ConfigCodeMirror{
        
        public readonly value: string
        public readonly mode: string
        public readonly theme: string
        public readonly lineNumbers: boolean

        constructor(
            {value, mode, theme, lineNumbers} :
            {value: string, mode: string,theme: string,lineNumbers: boolean}
            ) {
                this.value = value
                this.mode = mode
                this.theme = theme
                this.lineNumbers = lineNumbers
            }
    }


    /**
     *  ## Abstract
     * 
     * The editor module is used to edit static or dynamic text-content that is send to the 
     * output.
     * 
     * Typical use-cases include:
     * -    allows the user to edit a predefined code and updates some downstream visualization
     * -    display and edit a file content (pluged after the FilePicker module of the flux-files modules-box for instance)
     *
     * A couple examples of flux applications can be found [here](../index.html).
     * 
     * ## Inputs/Outputs
     * 
     * The module features one input and one output.
     * 
     * The input of the module is not expected to convey specific data, only the configuration part 
     * of the input is used. You can overide the [[PersistentData]] properties using an adaptor for dynamic display.
     * 
     * The output of the module is essentially conveying the edited content (see [[ModuleEditor.Output]])
     * 
     * ## Helpers
     * 
     * Some [[ModuleEditor.helpers]] functions are provided to use within an adaptor.
     * 
     */
    @Flux({
        pack: pack,
        namespace: ModuleEditor,
        id: "Editor",
        displayName: "Editor",
        description: "Editor",
        resources: {
            'technical doc': `${pack.urlCDN}/dist/docs/modules/lib_editor_module.moduleeditor.html`,
        }
    })
    @BuilderView({
        namespace: ModuleEditor,
        icon: svgIcon
    })
    @RenderView({
        namespace: ModuleEditor,
        render: RenderHtmlElement,
        wrapperDivAttributes: (_) => {
            return { style: { height: "100%", width: "100%" } }
        }
    })
    export class Module extends ModuleFlux {
        

        /* This function, by default the one provided by code-mirror, is creating the editor.
        *  It is mostly here for the purpose of testing (CodeMirror editor creation is having trouble in jest 
        *  environment)
        */
        static createEditor : (elem: HTMLDivElement, config: ConfigCodeMirror) => any = CodeMirror


        /**
         * Output pipe of the module
         */
        public readonly output$ : Pipe<OutputData>

        /**
         * Last data received and formatted 
         */
         public readonly parsedData$ : rxjs.Observable<{configCM:ConfigCodeMirror, context: any}>

        constructor(params) {
            super({...params, ...{helpers} })

            let data0 = {configuration:this.getPersistentData<PersistentData>(), context:{}}
            let rawData$ = new BehaviorSubject<{configuration: PersistentData, context: any}>(data0)

            this.addInput({
                id:"input",  
                description: "If provided, retrieve the 'content' property of the configuration to override the default one",
                contract: contract({
                    description: "No data required from input besides configuration",
                    requireds:{}
                }), 
                onTriggered: ({configuration, context}) => rawData$.next({configuration, context})
            })

            this.output$ = this.addOutput({id:"content"})

            this.parsedData$ = rawData$.pipe(
                switchMap( ({configuration, context} : {configuration:PersistentData, context: any}) => {
                    return this.fetchResources$(configuration).pipe(
                        map( () => ({ configCM: configuration.toCodeMirror(), context}) )
                    )
                })
            )
        }
        
        sendContent(newContent: string, configCM : ConfigCodeMirror, context: any){

            let outputData = new OutputData({
                content:newContent, 
                isModified: () => newContent != configCM.value}) 
            this.output$.next({data:outputData, context: context})          
        }

        fetchResources$( configuration: PersistentData ){

            let mode = configuration.mode 
            let resources$ : rxjs.Observable<any>[] = [
                this.environment.fetchStyleSheets(`codemirror#5.52.0~theme/${configuration.theme}.min.css`)
            ]
            if(cssResourcesName[mode])
                resources$.push(this.environment.fetchJavascriptAddOn(`codemirror#5.52.0~mode/${cssResourcesName[mode]}.min.js`))
                
            return rxjs.forkJoin(resources$)
        }
    }
    
    //--------------------------------------------------------
    // View 
    //--------------------------------------------------------
   
    function RenderHtmlElement(mdle: Module) {

        let vDOM : VirtualDOM = {
            class:'h-100 w-100',
            connectedCallback: (elem) => {

                elem.subscriptions.push(
                    mdle.parsedData$.subscribe(({configCM,context}) => {

                        elem.querySelector(".CodeMirror") && elem.querySelector(".CodeMirror").remove()                     
                        let editor = Module.createEditor(elem as unknown as HTMLDivElement, configCM) 
                        editor.on("changes" , () => mdle.sendContent(editor.getValue(), configCM, context))
                        mdle.sendContent(editor.getValue(),  configCM, context)
                    })
                )
            }
        }
        return render(vDOM)        
        // At some point we needed a resize oberver to trigger display, check at flux-pack-io => code-editor.module in case 
    }
}