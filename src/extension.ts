import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'

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
        if (ext !== '.js') {
          warn('only support js file convert to ts!')
        }
        const tsfile = file.slice(0, file.indexOf(ext)) + ext.replace('j', 't')
        fs.writeFileSync(tsfile, 'new ts file', {
          encoding: 'utf-8',
        })

        vscode.workspace.openTextDocument(tsfile).then(document => {
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
