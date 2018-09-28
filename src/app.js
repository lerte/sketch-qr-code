import sketch from 'sketch'
import dialog from '@skpm/dialog'
import QRCode from './lib/qrcode'
// documentation: https://developer.sketchapp.com/reference/api/

export default function main(context) {
  const str = sketch.UI.getStringFromUser("Please input QR code value", '^_^')
  const qrcode = new QRCode(str)
  const options = qrcode.options
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
                color: options.color,
                fill: sketch.Style.FillType.Color
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
    name: `qr-${str}`,
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
  
export function about(){
  dialog.showMessageBox({
    message: 'About Sketch QRCode',
    detail: `This Plugin uses QRCode.js library [https://github.com/davidshimjs/qrcodejs] \n\nIt's for generate svg QR Code in Sketch app.`,
    buttons: ['Feedback', 'Edit Settings', 'Reset Settings', 'Cancel']
  }, ({response})=>{
    switch (response) {
      case 0: // Feedback
        const url = 'https://github.com/lerte/sketch-qr-code/issues/new'
        const nsurl = NSURL.URLWithString(url)
        NSWorkspace.sharedWorkspace().openURL(nsurl)
        return
      case 1: // Edit Settings
        return
      case 2: // Reset Settings
        return
      case 3: // Cancel
        return
			default:
			throw new Error("Unknwon response: " + response)
    }
  })
}
