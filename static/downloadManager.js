var uploadPrototype = $('.file-info.wz-prototype')
var win = $(this)
var isElectron = typeof process !== 'undefined'

let itemId = 0
let totalQueue = {}
let widgetHidden = true

if(isElectron){
  const {ipcRenderer} = require('electron')
  ipcRenderer.on('download-info', (event, arg) => {
    console.log('download-info: ',  JSON.parse(arg))
    let file = JSON.parse(arg)
    //let queueSize = queue.length()
    addToQueue(file)
    let uploadDom = uploadPrototype.clone().removeClass('wz-prototype').addClass('uploadDom')
    uploadDom.addClass('download-from-electron')
    uploadDom.addClass('upload-' + file.id)
    uploadDom.find('.name').text(file.name)
    uploadDom.find('.file-size').text(bytesToSize(file.size))
    uploadDom.find('.file-progress').text(lang.pending)
    $('.content').prepend(uploadDom)
    //setHeaderTitle(queueSize)
  })
  ipcRenderer.on('download-progress', (event, arg) => {
    let progressObject = JSON.parse(arg)
    //console.log('download-progress: ', progressObject.progress)
    setUploadProgress(progressObject.id, progressObject.progress)
  })
  ipcRenderer.on('download-end', (event, arg) => {
    console.log('download-end: ', arg)
    api.fs(arg, function(error, updatedFSNode){
      if(error) return console.error(error)
      $('.file-info.upload-' + updatedFSNode.id).data('fsnode',updatedFSNode)
      $('.file-info.upload-' + updatedFSNode.id).addClass('finished')
    })
  })
}

console.log('isElectron', isElectron)

var addToQueue = function(file){

  if(widgetHidden){
    win.show()
    widgetHidden = false
  }
  totalQueue[itemId] = file
  itemId++
}


var bytesToSize = function (bytes) {
  var sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  if (bytes == 0) return '0 Byte'
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
}

var translateInterface = function(){
  $('.file-info .open div').text(lang.downloadManager.open)
  $('.header .see-more .text').text(lang.downloadManager.seeLess)
  setHeaderTitle(0)
}

var setHeaderTitle = function(queueSize){
  let text = `${lang.downloadManager.importing} ${queueSize} ${lang.downloadManager.file}`
  if(queueSize > 1 || queueSize === 0){
    text = text + 's'
  }
  $('.header .summary .title').text(text)
}

var setHeaderProgress = function(progress){
  $('.header .summary .subtitle').text(`(${progress})%`)
  setProgress(progress)
}
  
var setUploadProgress = function(fsnodeID, progress, totalProgress){
  var percentage = parseFloat(progress * 100).toFixed(1)
  totalProgress = parseFloat(totalProgress * 100).toFixed(1)
  setHeaderProgress(totalProgress)
  $('.file-info.upload-' + fsnodeID).addClass('in-progress')
  $('.file-info.upload-' + fsnodeID).find('.file-progress').text(percentage + '%')
  //console.log(fsnodeID, $('.file-info.upload-' + fsnodeID))
}

api.upload
  .on('conflict', function(data){
    alert(data.origin + ' ' + lang.alreadyExists + ' ' + lang.destinyFolder)
  })
  .on('fileEnqueued', function (file, queue) {
    console.log(file, queue)
    addToQueue(file)
    let queueSize = Object.keys(totalQueue).length
    let uploadDom = uploadPrototype.clone().removeClass('wz-prototype').addClass('uploadDom')
    uploadDom.addClass('upload-queue-' + file.id)
    uploadDom.find('.name').text(file.name)
    uploadDom.find('.file-size').text(bytesToSize(file.size))
    uploadDom.find('.file-progress').text(lang.pending)
    $('.content').prepend(uploadDom)
    setHeaderTitle(queueSize)
  })
  .on('fsnodeStart', function (fsnode, queue) {
    //console.log(fsnode,queue)
    $('.file-info.upload-queue-' + queue.current.id).addClass('upload-' + fsnode.id)
  })
  .on('fsnodeEnd', function(fsnode) {
    console.log('fsnodeEnd', fsnode)
    api.fs(fsnode.id, function(error, updatedFSNode){
      if(error) return console.error(error)
      $('.file-info.upload-' + updatedFSNode.id).data('fsnode',updatedFSNode)
      $('.file-info.upload-' + updatedFSNode.id).addClass('finished')
    })
  })
  .on('fsnodeProgress', function (fsnodeID, progress, queue) {
    var totalProgress = queue.progress()
    setUploadProgress(fsnodeID, progress, totalProgress)
  })
  .on('fsnodeQueueEnd', function () {
    //TODO closeApp
    //api.app.close()
  })

win.on('click', '.see-more', function(){
  win.toggleClass('contracted')
  $('.header .see-more .text').text( win.hasClass('contracted') ? lang.downloadManager.seeMore : lang.downloadManager.seeLess )
})

.on('click', '.file-info .open', function(){
  let fsnode = $(this).parent().data('fsnode')
  console.log(fsnode)
  fsnode.open()
})

translateInterface()

var circle = $('.progress-ring__circle')[0];
var radius = circle.r.baseVal.value;
var circumference = radius * 2 * Math.PI;

circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = `${circumference}`;

function setProgress(percent) {
  const offset = circumference - percent / 100 * circumference;
  circle.style.strokeDashoffset = offset;
}
