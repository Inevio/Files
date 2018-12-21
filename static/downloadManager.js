var uploadPrototype = $('.file-info.wz-prototype')
var win = $(this)

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
    
  })
  .on('fsnodeStart', function (fsnode, queue) {
    
    let queueSize = queue.length()
    let uploadDom = uploadPrototype.clone().removeClass('wz-prototype').addClass('uploadDom')
    uploadDom.addClass('upload-' + fsnode.id)
    uploadDom.find('.name').text(fsnode.name)
    uploadDom.find('.file-size').text(fsnode.size)
    uploadDom.find('file-progress').text(lang.pending)
    $('.content').append(uploadDom)
    setHeaderTitle(queueSize)
  })

  .on('fsnodeProgress', function (fsnodeID, progress, queue) {
    console.log(progress, queue)
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

translateInterface()