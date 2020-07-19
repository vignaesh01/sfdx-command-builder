// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as child from 'child_process';
var fs = require("fs");
var clipboardy = require('clipboardy');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
		console.log('Congratulations, your extension "sfdx-command-builder" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('sfdxCmdBuilder.openCmdBuilder', () => {
		// The code you place here will be executed every time your command is executed
		CodingPanel.createOrShow(context.extensionPath);
		
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

class CodingPanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: CodingPanel | undefined;

	public static readonly viewType = 'Coding';
	public static readonly outputChannelName = 'SFDX Command Builder';
	private readonly _outputChannel : vscode.OutputChannel;
	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionPath: string;
	private _disposables: vscode.Disposable[] = [];
	
	public static createOrShow(extensionPath: string) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (CodingPanel.currentPanel) {
			CodingPanel.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			CodingPanel.viewType,
			'SFDX Command Builder',
			column || vscode.ViewColumn.One,
			{
				// Enable javascript in the webview
				enableScripts: true,
				retainContextWhenHidden: true
				// And restrict the webview to only loading content from our extension's `media` directory.
				//localResourceRoots: [vscode.Uri.file(path.join(extensionPath, 'media'))]
			}
		);

		CodingPanel.currentPanel = new CodingPanel(panel, extensionPath);

	}

	public static revive(panel: vscode.WebviewPanel, extensionPath: string) {
		CodingPanel.currentPanel = new CodingPanel(panel, extensionPath);
	}

	private constructor(panel: vscode.WebviewPanel, extensionPath: string) {
		this._panel = panel;
		this._extensionPath = extensionPath;

		//setting up the Output Channel
		this._outputChannel =vscode.window.createOutputChannel(CodingPanel.outputChannelName);
		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		/*this._panel.onDidChangeViewState(
			e => {
				if (this._panel.visible) {
					this._update();
				}
			},
			null,
			this._disposables
		);*/

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'fetchAllCommands':
						console.log('onDidReceiveMessage fetchAllCommands');
						this.fetchAllCommands();
						return;
					
					case 'openFileDialog':
						console.log('onDidReceiveMessage openFileDialog');
						this.openFileDialog(message.flag);
						return;

					case 'executeCommand':
						console.log('onDidReceiveMessage executeCommand');
						this.executeCommand(message.generatedCmd);
						return;
					
					case 'copyToClipboard':
						console.log('onDidReceiveMessage copyToClipboard');
						this.copyToClipboard(message.generatedCmd);
						return;


				}
			},
			null,
			this._disposables
		);
	}

	
	private fetchAllCommands(){
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "Retrieving Commands",
			cancellable: true
		}, (progress, token) => {
			
			token.onCancellationRequested(() => {
				console.log("User canceled the long running operation");
			});

			

			var p = new Promise(resolve => {
				//let sfdxCmd ="sfdx force:doc:commands:display --json ";
				let sfdxCmd ="sfdx commands --json ";
				let workspacePath = vscode.workspace.workspaceFolders;
				let foo: child.ChildProcess = child.exec(sfdxCmd,{
					maxBuffer: 1024 * 1024 * 6,
					cwd: workspacePath?workspacePath[0].uri.fsPath:""
				});

				let bufferOutData='';

			foo.stdout.on("data",(dataArg : any)=> {
				console.log('stdout: ' + dataArg);
				bufferOutData+=dataArg;
			});
	
			foo.stderr.on("data",(data : any)=> {
				console.log('stderr: ' + data);
				vscode.window.showErrorMessage(data);
				resolve();
			});
	
			foo.stdin.on("data",(data : any)=> {
				console.log('stdin: ' + data);
				//vscode.window.showErrorMessage(data);
				resolve();
			});
			
			foo.on('exit',(code,signal)=>{
				console.log('exit code '+code);
				console.log('bufferOutData '+bufferOutData);
				
				let data = JSON.parse(bufferOutData);
				//let results = data.result;
				this._panel.webview.postMessage({ command: 'onFetchAllCommands', results : data});
				resolve();
			});
				
			});

			return p;
			
		});
	}
	
	private openFileDialog(flag:any){
		let isFile=(flag.type=='filepath');
		const options = {
		  canSelectMany: false,
		  canSelectFiles: isFile,
		  canSelectFolders : !isFile,
		  openLabel: 'Open'
	 	};
	 
		vscode.window.showOpenDialog(options).then(fileUri => {
			if (fileUri && fileUri[0]) {
				console.log('Selected file: ' + fileUri[0].fsPath);
				flag.value=fileUri[0].fsPath;
				this._panel.webview.postMessage({ command: 'onFileSelected', results : flag});
			}
		});
	}

	private executeCommand(generatedCmd : string){
		console.log("executeCommand invoked");
		
		let cmdExecMessage : string="===Executing SFDX CLI command===\n\n";
		cmdExecMessage+=generatedCmd+"\n\n";
		this._outputChannel.appendLine(cmdExecMessage);
		this._outputChannel.show(false);
		
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "Executing Command",
			cancellable: true
		}, (progress, token) => {
			
			token.onCancellationRequested(() => {
				console.log("User canceled the long running operation");
			});

			

			var p = new Promise(resolve => {
				let sfdxCmd =generatedCmd;
				let workspacePath = vscode.workspace.workspaceFolders;
				let foo: child.ChildProcess = child.exec(sfdxCmd,{
					maxBuffer: 1024 * 1024 * 6,
					cwd: workspacePath?workspacePath[0].uri.fsPath:""
				});

				let bufferOutData='';

			foo.stdout.on("data",(dataArg : any)=> {
				console.log('stdout: ' + dataArg);
				bufferOutData+=dataArg;
			});
	
			foo.stderr.on("data",(data : any)=> {
				console.log('stderr: ' + data);
				vscode.window.showErrorMessage(data);
				this._outputChannel.appendLine("===Error Encountered===\n");
				this._outputChannel.appendLine(data);
				this._outputChannel.show(false);
				resolve();
			});
	
			foo.stdin.on("data",(data : any)=> {
				console.log('stdin: ' + data);
				//vscode.window.showErrorMessage(data);
				resolve();
			});
			
			foo.on('exit',(code,signal)=>{
				console.log('exit code '+code);
				console.log('bufferOutData '+bufferOutData);
				
				if(code==0){
					this._outputChannel.appendLine("===Results===\n");
					this._outputChannel.appendLine(bufferOutData);
					this._outputChannel.show(false);
				}
				
				resolve();
			});
				
			});

			return p;
			
		});
	}

	private copyToClipboard(generatedCmd : string){
		clipboardy.write(generatedCmd).then((result:any)=>{
			console.log(result);
			vscode.window.showInformationMessage("Command Copied to Clipboard successfully!!");
		});
	}

	public dispose() {
		CodingPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _update() {

		this._panel.title = 'SFDX Command Builder';
		this._panel.webview.html = this._getHtmlForWebview();

		//Intial load content
	}

	
	private _getHtmlForWebview() {
		// Local path to main script run in the webview
		const scriptPathOnDisk = vscode.Uri.file(
			path.join(this._extensionPath, 'media', 'App.js')
		);

		// And the uri we use to load this script in the webview
		const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });


		// Use a nonce to whitelist which scripts can be run
		const nonce = getNonce();

		return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">

                <!--
                Use a content security policy to only allow loading images from https or from our extension directory,
                and only allow scripts that have a specific nonce.
                -->
                <!--
				<meta
				http-equiv="Content-Security-Policy"
				content="default-src 'none'; img-src vscode-resource: https:; script-src vscode-resource: https: 'nonce-${nonce}'; style-src vscode-resource: https:;"
			  /> -->

			  <meta http-equiv="Content-Security-Policy" content="default-src *; connect-src vscode-resource: https:;img-src vscode-resource: https:; style-src 'unsafe-inline' vscode-resource: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' vscode-resource: https:">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
				<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
                <title>SFDX Command Builder</title>
            </head>
			<body>
						
						
			<div id="root"></div>
			
			<!-- Production scripts -->
			<script src="https://unpkg.com/react@16.12.0/umd/react.production.min.js" crossorigin></script>
			<script src="https://unpkg.com/react-dom@16.12.0/umd/react-dom.production.min.js" crossorigin></script>
			<script src="https://unpkg.com/@material-ui/core@v4.8.3/umd/material-ui.production.min.js" crossorigin="anonymous"></script>
			
			<!--<script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>-->
			
			<!--Development scripts -->
			<!--
			<script src="https://unpkg.com/react@16.12.0/umd/react.development.js" crossorigin="anonymous"></script>
    		<script src="https://unpkg.com/react-dom@16.12.0/umd/react-dom.development.js" crossorigin></script>
			<script src="https://unpkg.com/@material-ui/core@v4.8.3/umd/material-ui.development.js" crossorigin="anonymous"></script>
			-->

			<script src="${scriptUri}"></script>
            </body>
            </html>`;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
/**
 * watch for babel
 * npx babel --watch jsx-src --out-dir media --presets react-app/prod 
 */