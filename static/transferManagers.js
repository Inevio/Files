var win = $(this)
var isElectron = typeof process !== 'undefined'

let downloadManager = $('.manager.download-manager')
let uploadManager = $('.manager.upload-manager')

let itemId = 0
let totalQueueUpload = {}
let totalQueueDownload = {}
let uploadHidden = true
let downloadHidden = true
var uploadPrototype = $('.file-info.wz-prototype', uploadManager)
var downloadPrototype = $('.file-info.wz-prototype', downloadManager)

const shell = isElectron ? require('electron').shell : null

if (isElectron) {
  const { ipcRenderer } = require('electron')
  // Upload events
  ipcRenderer.on('upload-from-download-proccessing', (event, arg) => {
    console.log('download-info: ', JSON.parse(arg))
    let file = JSON.parse(arg)
    // let queueSize = queue.length()
    addToQueue(file, true)
    let uploadDom = uploadPrototype.clone().removeClass('wz-prototype').addClass('uploadDom')
    uploadDom.addClass('upload-from-electron')
    uploadDom.addClass('fileTemporalID-' + file.temporalID)
    uploadDom.find('.name').text(file.name)
    // uploadDom.find('.file-size').text(bytesToSize(file.size))
    uploadDom.find('.file-progress').text(lang.proccessing)
    // uploadDom.find('.arrow').hide()
    $('.content', uploadManager).prepend(uploadDom)
    let queueSize = Object.keys(totalQueueUpload).length
    setQueueSizeDom(queueSize, true)
  })

  ipcRenderer.on('upload-from-download-info', (event, arg) => {
    console.log('download-info: ', JSON.parse(arg))
    let file = JSON.parse(arg)
    let needToInsert = !!$('fileTemporalID-' + file.temporalID).length
    console.log('El MIME ES: ', file)
    if (needToInsert) {
      addToQueue(file, true)
      let uploadDom = uploadPrototype.clone().removeClass('wz-prototype').addClass('uploadDom')
      uploadDom.addClass('upload-from-electron')
      uploadDom.addClass('fileID-' + file.id)
      uploadDom.find('.name').text(file.name)
      uploadDom.find('.file-size').text(bytesToSize(file.size))
      uploadDom.find('.file-progress').text(lang.pending)
      $('.content', uploadManager).prepend(uploadDom)
      let queueSize = Object.keys(totalQueueUpload).length
      setQueueSizeDom(queueSize, true)
    } else {
      $('.fileTemporalID-' + file.temporalID).addClass('fileID-' + file.id)
      // $('.fileTemporalID-' + file.temporalID + ' .arrow').show()
      $('.fileTemporalID-' + file.temporalID + ' .file-size').text(bytesToSize(file.size))
      $('.fileTemporalID-' + file.temporalID + ' .file-progress').text(lang.pending)
    }
  })
  ipcRenderer.on('upload-from-download-progress', (event, arg) => {
    let progressObject = JSON.parse(arg)
    // console.log('download-progress: ', progressObject.progress)
    setProgress(progressObject.id, progressObject.progress, null, true)
  })
  ipcRenderer.on('upload-from-download-end', (event, arg) => {
    console.log('download-end: ', arg)
    api.fs(arg, function (error, updatedFSNode) {
      if (error) return console.error(error)
      $('.file-info.fileID-' + updatedFSNode.id, uploadManager).data('fsnode', updatedFSNode)
      $('.file-info.fileID-' + updatedFSNode.id, uploadManager).addClass('finished')
    })
  })
  // Download events
  ipcRenderer.on('horbito-download-info', (event, arg) => {
    console.log('horbito-download-info: ', JSON.parse(arg))
    let file = JSON.parse(arg)
    // let queueSize = queue.length()
    console.log('El MIME ES: ', file)
    addToQueue(file, false)
    let uploadDom = downloadPrototype.clone().removeClass('wz-prototype')
    uploadDom.addClass('download-from-electron')
    uploadDom.addClass('fileID-' + file.id)
    uploadDom.find('.name').text(file.name)
    if (file.size === 0) {
      uploadDom.find('.file-size').text('-')
    } else {
      uploadDom.find('.file-size').text(bytesToSize(file.size))
    }
    uploadDom.find('.file-progress').text(lang.pending)
    $('.content', downloadManager).prepend(uploadDom)
    let queueSize = Object.keys(totalQueueDownload).length
    setQueueSizeDom(queueSize, false)
  })
  ipcRenderer.on('horbito-download-progress', (event, arg) => {
    let progressObject = JSON.parse(arg)
    // console.log('download-progress: ', progressObject.progress)
    setProgress(progressObject.id, progressObject.progress, null || progressObject.isFolder, false)
  })
  ipcRenderer.on('horbito-download-end', (event, arg) => {
    let endObject = JSON.parse(arg)
    console.log('download-end: ', endObject, $('.file-info.fileID-' + endObject.id, downloadManager))
    $('.file-info.fileID-' + endObject.id, downloadManager).addClass('finished')
    $('.file-info.fileID-' + endObject.id, downloadManager).data('path', endObject.path)
  })
}

console.log('isElectron', isElectron)

var addToQueue = function (file, isUpload) {
  win.show()
  console.log('addToQueue', isUpload, uploadHidden, downloadHidden)
  if (uploadHidden && isUpload) {
    uploadManager.show()
    uploadHidden = false
  } else if (downloadHidden && !isUpload) {
    downloadManager.show()
    downloadHidden = false
  }

  if (isUpload) {
    totalQueueUpload[itemId] = file
    itemId++
  } else {
    totalQueueDownload[file.id] = file
  }
}

var bytesToSize = function (bytes) {
  var sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  if (bytes == 0) return '0 Byte'
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
}

var translateInterface = function () {
  $('.file-info .open div').text(lang.transferManagers.open)
  $('.header .summary .title', downloadManager).text(lang.transferManagers.downloading)
  $('.header .summary .title', uploadManager).text(lang.transferManagers.importing)
  /* setQueueSizeDom(0, true)
  setQueueSizeDom(0, false) */
}

var setQueueSizeDom = function (queueSize, isUpload) {
  let container = isUpload ? uploadManager : downloadManager
  let text = `${queueSize} ${lang.transferManagers.file}`
  if (queueSize !== 1) {
    text = text + 's'
  }
  console.log('text', text)
  $('.header .summary .number-of-files', container).text(text)
}

var setHeaderProgress = function (progress, isUpload) {
  let container = isUpload ? uploadManager : downloadManager
  $('.header .summary .percentage', container).text(`(${progress}%)`)
  setCircleProgress(progress, isUpload)
}

var setProgress = function (fsnodeID, progress, totalProgress, isUpload) {
  let container = isUpload ? uploadManager : downloadManager
  if (totalProgress === true) {
    $('.file-info.fileID-' + fsnodeID, container).addClass('in-progress')
    $('.file-info.fileID-' + fsnodeID, container).find('.file-progress').text(progress)
  } else {
    var percentage = parseFloat(progress * 100).toFixed(1)
    totalProgress = parseFloat(totalProgress * 100).toFixed(1)
    // setHeaderProgress(totalProgress, isUpload)
    $('.file-info.fileID-' + fsnodeID, container).addClass('in-progress')
    $('.file-info.fileID-' + fsnodeID, container).find('.file-progress').text(percentage + '%')
    // console.log(fsnodeID, $('.file-info.upload-' + fsnodeID))
  }
}

api.upload
  .on('conflict', function (data) {
    console.error(data.origin + ' ' + lang.alreadyExists + ' ' + lang.destinyFolder)
  })
  .on('fileEnqueued', function (file, queue) {
    console.log('fichero', file)
    console.log('El MIME ES: ', file)
    if (file.directory === false) {
      // console.log('fichero añadido a la cola', file, file.fsnode === null, file.fsnode.type !== 2)
      addToQueue(file, true)
      let queueSize = Object.keys(totalQueueUpload).length
      let uploadDom = uploadPrototype.clone().removeClass('wz-prototype').addClass('uploadDom')
      uploadDom.addClass('upload-queue-' + file.id)
      uploadDom.find('.name').text(file.name)
      uploadDom.find('.file-size').text(bytesToSize(file.size))
      uploadDom.find('.file-progress').text(lang.pending)
      $('.content', uploadManager).prepend(uploadDom)
      setQueueSizeDom(queueSize, true)
    }
  })
  .on('fsnodeStart', function (fsnode, queue) {
    // console.log(fsnode,queue)
    $('.file-info.upload-queue-' + queue.current.id, uploadManager).addClass('fileID-' + fsnode.id)
  })
  .on('fsnodeEnd', function (fsnode) {
    // console.log('fsnodeEnd', fsnode)
    api.fs(fsnode.id, function (error, updatedFSNode) {
      if (error) return console.error(error)
      $('.file-info.fileID-' + updatedFSNode.id, uploadManager).data('fsnode', updatedFSNode)
      $('.file-info.fileID-' + updatedFSNode.id, uploadManager).addClass('finished')
    })
  })
  .on('fsnodeProgress', function (fsnodeID, progress, queue) {
    var totalProgress = queue.progress()
    setProgress(fsnodeID, progress, totalProgress, true)
  })
  .on('fsnodeQueueEnd', function () {
    // TODO closeApp
    // api.app.close()
  })

win.on('click', '.see-more', function () {
  let container = $(this).parents('.manager')
  container.toggleClass('contracted')
})

  .on('click', '.file-info .open', function () {
    let isDownload = $(this).parent().hasClass('download-from-electron')
    if (isDownload) {
      let path = $(this).parent().data('path')
      shell.openItem(path)
    } else {
      let fsnode = $(this).parent().data('fsnode')
      console.log(fsnode)
      fsnode.open()
    }
  })

  .on('click', '.close-button', function () {
    let container = $(this).parents('.manager')
    container.hide()
    container.hasClass('upload-manager') ? uploadHidden = true : downloadHidden = true
    container.find('.see-more').click()
  })

  .on('click', '.manager .left-progress', function () {
    $(this).parents('.manager').toggleClass('done')
    let gifURL = $(this).find('.done-gif').css('background-image')
    $(this).find('.done-gif').css('background-image', 'url("")').css('background-image', gifURL)
  })

translateInterface()

/* var circleUpload = $('.upload-manager .progress-ring__circle')[0]
var circleDownload = $('.download-manager .progress-ring__circle')[0]
var radius = circleUpload.r.baseVal.value
var circumference = radius * 2 * Math.PI

circleUpload.style.strokeDasharray = `${circumference} ${circumference}`
circleDownload.style.strokeDasharray = `${circumference} ${circumference}`
circleUpload.style.strokeDashoffset = `${circumference}`
circleDownload.style.strokeDashoffset = `${circumference}`

function setCircleProgress (percent, isUpload) {
  const offset = circumference - percent / 100 * circumference
  if (isUpload) {
    circleUpload.style.strokeDashoffset = offset
  } else {
    circleDownload.style.strokeDashoffset = offset
  }
} */
