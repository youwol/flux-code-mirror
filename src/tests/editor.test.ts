import { instantiateModules, MockEnvironment, ModuleDataEmittor, parseGraph, renderTemplate, Runner,  } from "@youwol/flux-core"
import { render } from "@youwol/flux-view"
import { BehaviorSubject } from "rxjs"
import { ModuleEditor } from "../lib/editor.module"
import { pack } from "../lib/main"

console.log = () => {}

function mockEditorCreation(div: HTMLDivElement, option: ModuleEditor.ConfigCodeMirror){

    let value$ = new BehaviorSubject(option.value)
    let callbacks = {
        changes: undefined
    }
    let editor = {
        callbacks,
        on: (target:string, cb) => {
            callbacks[target] = cb
        },
        getValue: () => {
            return value$.getValue()
        }
    }
    let VDOM = {
        tag:'textarea',
        id: 'code-editor',
        value: option.value,
        class: `CodeMirror ${option.mode} ${option.theme}`,
        onchange: (event) => {
            value$.next(event.target.value)
            editor.callbacks.changes() 
        }
    }
    let editorDiv = render(VDOM)
    document.body.appendChild(editorDiv)
    div.appendChild(editorDiv)

    return editor
}

ModuleEditor.Module.createEditor = mockEditorCreation


test('test install', () => {

    let environment = new MockEnvironment({},[])
    pack.install(environment)
    expect(MockEnvironment.css.length).toEqual(2)
})


test('initialization', (done) => {
    
    let branches = [
        '--|~editor~|--'
    ] 
    let modules     : {
        editor: ModuleEditor.Module,
    } = instantiateModules({
        editor: ModuleEditor
    }, {environment: new MockEnvironment({},[])}) 
    let graph       = parseGraph( { branches, modules } )
    
    new Runner( graph )
    let div = document.createElement('div') as HTMLDivElement
    div.innerHTML = '<div id="editor" > </div>'
    document.body.appendChild(div)

    renderTemplate(div, Object.values(modules))
    expect(document.getElementById("editor").getAttribute('width')).toEqual("100%")
    expect(document.getElementById("editor").getAttribute('height')).toEqual("100%")
    let editorDiv : HTMLTextAreaElement = div.querySelector("#code-editor") as HTMLTextAreaElement
    expect(editorDiv.value).toEqual(ModuleEditor.defaultContent)
    modules.editor.output$.subscribe(({data}) => {
        expect(data.content).toEqual(ModuleEditor.defaultContent)
        expect(data.isModified()).toBeFalsy()
        document.body.innerHTML=""
        done()
    })  
})

test('editing text', (done) => {
    
    let branches = [
        '--|~editor~|--'
    ] 
    let modules     : {
        editor: ModuleEditor.Module,
    } = instantiateModules({
        editor: ModuleEditor
    }, {environment: new MockEnvironment({},[])}) 
    let graph       = parseGraph( { branches, modules } )
    
    new Runner( graph )
    let div = document.createElement('div') as HTMLDivElement
    div.innerHTML = '<div id="editor" > </div>'
    document.body.appendChild(div)

    renderTemplate(div, Object.values(modules))
    let editorDiv : HTMLTextAreaElement = div.querySelector("#code-editor") as HTMLTextAreaElement
    expect(editorDiv.value).toEqual(ModuleEditor.defaultContent);
    
    (editorDiv as any).onchange({target:{value:"content changed"}})

    modules.editor.output$.subscribe(({data}) => {
        expect(data.content).toEqual("content changed")
        expect(data.isModified()).toBeTruthy()
        done()
    })  
})


test('dynamic content', (done) => {
    
    let branches = [
        '|~dataEmittor~|----|~editor~|--'
    ] 
    let modules     : {
        editor: ModuleEditor.Module,
        dataEmittor: ModuleDataEmittor.Module,
    } = instantiateModules({
        editor: ModuleEditor,
        dataEmittor: ModuleDataEmittor
    }, {environment: new MockEnvironment({},[])}) 

    let graph       = parseGraph( { branches, modules } )
    
    new Runner( graph )
    let div = document.createElement('div') as HTMLDivElement
    div.innerHTML = '<div id="editor" > </div>'
    document.body.appendChild(div)
    renderTemplate(div, Object.values(modules))
    
    
    modules.dataEmittor.emit({configuration:{content:"content changed"}});

    modules.editor.output$.subscribe(({data}) => {
        expect(data.content).toEqual("content changed")
        expect(data.isModified()).toBeFalsy()
        let editorDiv : HTMLTextAreaElement = div.querySelector("#code-editor") as HTMLTextAreaElement
        expect(editorDiv.value).toEqual("content changed")
        done()
    })  
})


test('get mode from extension', () => {
    
    let mode = ModuleEditor.helpers.getModeFromExtension("test.js")
    expect(mode).toEqual("javascript")
    mode = ModuleEditor.helpers.getModeFromExtension("test.ts")
    expect(mode).toEqual("javascript")
    mode = ModuleEditor.helpers.getModeFromExtension("test.html")
    expect(mode).toEqual("html")
    mode = ModuleEditor.helpers.getModeFromExtension("test.xml")
    expect(mode).toEqual("xml")
    mode = ModuleEditor.helpers.getModeFromExtension("test.css")
    expect(mode).toEqual("css")
    mode = ModuleEditor.helpers.getModeFromExtension("test.py")
    expect(mode).toEqual("python")
    mode = ModuleEditor.helpers.getModeFromExtension("test.custom", {".custom":"custom"})
    expect(mode).toEqual("custom")
    mode = ModuleEditor.helpers.getModeFromExtension("test")
    expect(mode).toEqual(undefined)

})
