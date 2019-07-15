import * as path from 'path'
import * as vscode from 'vscode'

import { convert } from './compile'

const warn = (message: string) => {
  vscode.window.showWarningMessage(message)
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    'extension.convertToTs',
    () => {
      if (vscode.window.activeTextEditor) {
        const file = vscode.window.activeTextEditor.document.fileName
        const ext = path.extname(file)
        if (ext.indexOf('.js') < 0) {
          warn('only support js file convert to ts!')
          return
        }
        const tsFile = convert(file)

        vscode.workspace.openTextDocument(tsFile).then(document => {
          vscode.window.showTextDocument(document)
        })
      } else {
        warn('You need to open the page you want to convert!')
      }
    }
  )

  context.subscriptions.push(disposable)
}

export function deactivate() {}
