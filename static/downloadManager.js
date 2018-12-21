var uploadPrototype = $('.file-info.wz-prototype')
var win = $(this)
var isElectron = typeof process !== 'undefined'

console.log('isElectron', isElectron)

var bytesToSize = function (bytes) {
  var sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  if (bytes == 0) return '0 Byte'
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
}

var translateInterface = function(){
  $('.header .see-more .text').text(lang.downloadManager.seeLess)
  setHeaderTitle(0)
}

var setHeaderTitle = function(queueSize){
  let text = `${lang.downloadManager.downloading} ${queueSize} ${lang.downloadManager.file}`
  if(queueSize > 1 || queueSize === 0){
    text = text + 's'
  }
  $('.header .summary .title').text(text)
}

var setHeaderProgress = function(progress){
  $('.header .summary .subtitle').text(`(${progress})%`)
}
  
var setUploadProgress = function(fsnodeID, progress){
  var percentage = parseFloat(progress * 100).toFixed(1)
  setHeaderProgress(percentage)
  $('.file-info.upload-' + fsnodeID).find('.file-progress').text(percentage + '%')
  //console.log(fsnodeID, $('.file-info.upload-' + fsnodeID))
}

api.upload
  .on('conflict', function(data){
    alert(data.origin + ' ' + lang.alreadyExists + ' ' + lang.destinyFolder)
  })
  .on('fileEnqueued', function (file, queue) {
    console.log(file, queue)
    let queueSize = queue.length()
    let uploadDom = uploadPrototype.clone().removeClass('wz-prototype').addClass('uploadDom')
    uploadDom.addClass('upload-queue-' + file.id)
    uploadDom.find('.name').text(file.name)
    uploadDom.find('.file-size').text(bytesToSize(file.size))
    uploadDom.find('.file-progress').text(lang.pending)
    $('.content').append(uploadDom)
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
    setUploadProgress(fsnodeID, progress)
  })
  .on('fsnodeQueueEnd', function () {
    //TODO closeApp
    //api.app.close()
  })

win.on('click', '.see-more', function(){
  win.toggleClass('contracted')
  $('.header .see-more .text').text( win.hasClass('contracted') ? lang.downloadManager.seeMore : lang.downloadManager.seeLess )
})

.on('click', '.file-info.finished', function(){
  let fsnode = $(this).data('fsnode')
  console.log(fsnode)
  fsnode.open()
})

translateInterface()