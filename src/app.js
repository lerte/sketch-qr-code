import sketch from 'sketch'
import dialog from '@skpm/dialog'
import QRCode from './lib/qrcode'
import NibUI from './lib/sketch-nibui'
import { Style } from 'sketch/dom'
// documentation: https://developer.sketchapp.com/reference/api/

export default function main(context) { 
  //Load View.nib
  const nibUI = new NibUI(context, 'View', [
    "backgroundTextField",
    "colorTextField",
    "contentTextField",
    "eclComboBox",
    "heightTextField",
    "paddingTextField",
    "typeNumberTextField",
    "widthTextField"
  ])

  // Configuring alert
  const alert = NSAlert.alloc().init()
  alert.setMessageText('Sketch QRCode')
  alert.addButtonWithTitle('Run')
  alert.addButtonWithTitle('Cancel')
  // alert.setIcon(NSImage.alloc().initWithContentsOfFile(context.plugin.urlForResourceNamed('icon.png').path()))
  alert.setAccessoryView(nibUI.view)
  const result = alert.runModal()
  if(result == NSAlertFirstButtonReturn) {
    let settings = {
      padding: nibUI.paddingTextField.intValue(),
      width: nibUI.widthTextField.intValue(), 
      height: nibUI.heightTextField.intValue(),
      typeNumber: nibUI.typeNumberTextField.intValue(),
      color: nibUI.colorTextField.stringValue(),
      background: nibUI.backgroundTextField.stringValue(),
      ecl: nibUI.eclComboBox.stringValue()
    }
    const content = nibUI.contentTextField.stringValue()
    generate(settings, content)
  }
}

function generate(inputSettings, content){
  const qrcode = new QRCode(`${content}`)
  const options = Object.assign(getDefaultSettings(), inputSettings)
  const modules = qrcode.qrcode.modules
  const width = options.width
  const height = options.height
  const length = modules.length
  const xsize = width / (length + 2 * options.padding)
  const ysize = height / (length + 2 * options.padding)

  let layers = []
  for (let y = 0; y < length; y++) {
    for (let x = 0; x < length; x++) {
      let module = modules[x][y]
      if (module) {
        let px = (x * xsize + options.padding * xsize).toString()
        let py = (y * ysize + options.padding * ysize).toString()
        layers.push({
          type: sketch.Types.Shape,
          frame: {
            x: px,
            y: py,
            width: xsize,
            height: ysize,
          },
          style: {
            fills: [
              {
                color: `${options.color}`,
                fillType: Style.FillType.Color,
              }
            ],
            borders: []
          }
        })
      }
    }
  }

  const document = sketch.fromNative(context.document)
  const page = document.selectedPage

  const group = new sketch.Group({
    name: `qr-${content}`,
    parent: page,
    frame: {
      x: 0,
      y: 0,
      width: options.width,
      height: options.height
    },
    layers
  })

  document.centerOnLayer(group)
}

function getDefaultSettings(){
  return {
		padding: 4,
		width: 256, 
		height: 256,
		typeNumber: 4,
		color: "#000000",
		background: "#ffffff",
		ecl: "M"
	}
}

export function about(){
  dialog.showMessageBox({
    message: 'About Sketch QRCode',
    detail: `This Plugin uses QRCode.js library [https://github.com/davidshimjs/qrcodejs] \n\nIt's for generate svg QR Code in Sketch app.`,
    buttons: ['Feedback', 'Cancel']
  }, ({response})=>{
    switch (response) {
      case 0: // Feedback
        const url = 'https://github.com/lerte/sketch-qr-code/issues/new'
        const nsurl = NSURL.URLWithString(url)
        NSWorkspace.sharedWorkspace().openURL(nsurl)
        return
      case 1: // Cancel
        return
			default:
			throw new Error("Unknwon response: " + response)
    }
  })
}
