var uploadPrototype = $('.file-info.wz-prototype')
var win = $(this)

var uploadProgress = function(fsnodeID, progress){
  $('.file-info.upload-' + fsnodeID).find('file-progress').text(progress*100 + '%')
}

api.upload
  .on('conflict', function(data){
    alert(data.origin + ' ' + lang.alreadyExists + ' ' + lang.destinyFolder)
  })
  .on('fileEnqueued', function (file, queue) {
  
  })
  .on('fsnodeStart', function (fsnode, queue) {
    let queueSize = queue.length()
    let uploadDom = uploadPrototype.clone().removeClass('.wz-prototype').addClass('uploadDom')
    uploadDom.addClass('upload-' + fsnode.id)
    uploadDom.find('.name').text(fsnode.name)
    uploadDom.find('.file-size').text(fsnode.size)
    uploadDom.find('file-progress').text(lang.pending)
    $('.content').append(uploadDom)
  })

  .on('fsnodeProgress', function (fsnodeID, progress, queue) {
    uploadProgress(fsnodeID, progress)
  })

  .on('fsnodeQueueEnd', function () {
    //TODO closeApp
    api.app.closeApp()
  })

win.on('click', '.see-more', function(){
  win.toggleClass('contracted')
})