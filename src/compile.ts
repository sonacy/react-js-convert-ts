import * as fs from 'fs'
import * as path from 'path'
import * as prettier from 'prettier'
import {
  CompilerOptions,
  createPrinter,
  createProgram,
  EmitHint,
  JsxEmit,
  ModuleKind,
  ScriptTarget,
  transform,
} from 'typescript'

import { rcDecoratorToHoc } from './transform/decoratorToHoc'
import { generateGenericPropAndState } from './transform/generateGenericPropAndState'
import { parseTsFunc } from './transform/parseTsFunc'
import { removeImportPropTypes } from './transform/removeImportPropTypes'
import { removeStaticPropTypes } from './transform/removeStaticPropTypes'

export const compile = (realPath: string, compileOptions: CompilerOptions) => {
  const program = createProgram([realPath], compileOptions)

  const sourceFiles = program
    .getSourceFiles()
    .filter(s => s.fileName === realPath)

  const typeChecker = program.getTypeChecker()

  const result = transform(sourceFiles, [
    generateGenericPropAndState(typeChecker),
    rcDecoratorToHoc(typeChecker),
    removeImportPropTypes(),
    removeStaticPropTypes(typeChecker),
    parseTsFunc(typeChecker),
  ])

  const printer = createPrinter()
  const printed = printer.printNode(
    EmitHint.SourceFile,
    result.transformed[0],
    sourceFiles[0]
  )

  const res = prettier.format(printed, {
    semi: true,
    singleQuote: true,
    trailingComma: 'es5',
    bracketSpacing: true,
    parser: 'typescript',
  })
  return res
}

export const convert = (realPath: string) => {
  const compileOptions: CompilerOptions = {
    target: ScriptTarget.ES2017,
    module: ModuleKind.ES2015,
    allowJs: true,
    jsx: JsxEmit.Preserve,
  }
  const res = compile(realPath, compileOptions)

  const name = realPath.slice(0, realPath.lastIndexOf('.'))
  const ext = path.extname(realPath).replace('j', 't')
  const retPath = `${name}${ext}`
  fs.writeFileSync(retPath, res, {
    encoding: 'utf8',
  })
  return retPath
}
