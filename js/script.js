
let setting = {
  touch: {
    x: null,
    y: null,
    lastX: null,
    lastY: null,
    swipe: null
  },
  calculator: {
    num: "0",
    resource: null
  },
  icon: {
    gold: "<i class='fas fa-euro-sign'></i>",
    steel: "<i class='fas fa-industry'></i>",
    titanium: "<i class='far fa-star'></i>",
    plant: "<i class='fas fa-leaf'></i>",
    energy: "<i class='fas fa-bolt'></i>",
    heat: "<i class='fas fa-bolt fa-xs'></i><i class='fas fa-bolt fa-xs'></i><i class='fas fa-bolt fa-xs'></i>"
  }
}

let game = {
  resources: {
    gold: 0,
    steel: 0,
    titanium: 0,
    plant: 0,
    energy: 0,
    heat: 0
  },
  production: {
    gold: 0,
    steel: 0,
    titanium: 0,
    plant: 0,
    energy: 0,
    heat: 0
  },
  generation: 1,
  terraRating: 20
}

/**
 * @typedef historyLogModel
 * @property {'production'|'TR'|'transferEnergy'|'generation'|'resources'} type
 * @property {'plus'|'minus'|'transferEnergy'} action
 * @property {'gold'|'steel'|'titanium'|'plant'|'energy'|'heat'|'terraRating'} resource
 * @property {Number} value
 * @property {Number} gen
 */
/**
 * @typedef historyLogGenerationModel
 * @property {'generation'} type
 * @property {Number} value
 */
/**
 * @typedef historyLogTransferEnergyModel
 * @property {'transferEnergy'} type
 * @property {'transferEnergy'} action
 * @property {'energy'} resource
 * @property {Number} value
 * @property {Number} gen
 */
/**
 * @typedef historyLogTrModel
 * @property {'TR'} type
 * @property {'plus'|'minus'} action
 * @property {'terraRating'} resource
 * @property {Number} value
 * @property {Number} gen
 */
/**
 * @typedef historyLogProductionModel
 * @property {'production'} type
 * @property {'plus'|'minus'} action
 * @property {'gold'|'steel'|'titanium'|'plant'|'energy'|'heat'} resource
 * @property {Number} value
 * @property {Number} gen
 */
/**
 * @typedef historyLogResourcesModel
 * @property {'resources'} type
 * @property {'plus'|'minus'} action
 * @property {'gold'|'steel'|'titanium'|'plant'|'energy'|'heat'} resource
 * @property {Number} value
 * @property {Number} gen
 */

/**
 * @type {[historyLogProductionModel,historyLogTrModel,historyLogTransferEnergyModel,historyLogGenerationModel,historyLogResourcesModel]}
 */
let historyLog = []
let undoTrack = []

initialize()

function initialize() {
  loadFromLocal()
}


function plus(resourceType, value, section, options) {
  let opts = Object.assign({}, options)
  let clearUndoTrack = opts.clearUndoTrack == false ? false : true
  if (section == 'resources' || section == 'production') {
    game[section][resourceType] += value
    // $("." + section + "." + resourceType).html(game[section][resourceType])


  }
  else if (section == "terraRating") {
    game[section] += value
  }


  if (opts["noLog"] !== true) {
    historyLog.push({ type: section, action: "plus", resource: resourceType, value: value, gen: game["generation"] })
  }
  populateHistory()
  renderGameState(clearUndoTrack)

}

function minus(resourceType, value, section, options) {
  console.log(options)
  let opts = Object.assign({}, options)
  let clearUndoTrack = opts.clearUndoTrack == false ? false : true
  if (section == 'resources') {
    if (game[section][resourceType] >= value || value == 0) {
      game[section][resourceType] -= value
      // $(".resources." + resourceType).html(game[section][resourceType])

    }
    else {
      return alert("insufficient " + resourceType + " resources")
    }
  }
  else if (section == 'production') {
    if (game[section][resourceType] > 0) {
      game[section][resourceType] -= value
      // $(".production." + resourceType).html(game[section][resourceType])

    }
    else if (game[section][resourceType] <= 0 && resourceType == "gold" && game[section][resourceType] > -5) {
      game[section][resourceType]--
      // $(".production." + resourceType).html(game[section][resourceType])

    }
    else {
      return alert("insufficient " + resourceType + " production")

    }
  }


  if (opts["noLog"] !== true) {
    historyLog.push({ type: section, action: "minus", resource: resourceType, value: value, gen: game["generation"] })
  }

  populateHistory()
  renderGameState(clearUndoTrack)

}

function transferEnergy() {
  let num = game["resources"]["energy"]
  plus("heat", num, "resources", { noLog: true })
  minus("energy", num, "resources", { noLog: true })
  historyLog.push({ type: "transferEnergy", action: "transferEnergy", resource: "energy", value: num, gen: game["generation"] })

}

function populateHistory() {
  $("#history").html("")
  for (var i = historyLog.length - 1; i >= 0; i--) {
    let actionType = historyLog[i]["action"] == "plus" ? "+" : " - "
    if (historyLog[i]["type"] == "generation") {
      $("#history").append(`
      <div class='col px-0 py-1 logrow'>
        <h5 class='text-center my-3 bg-light py-1'>Generation  ${actionType}  ${historyLog[i]["value"]} </h5>
      </div>`)
    }
    else if (historyLog[i]["type"] == "transferEnergy") {
      $("#history").append(`
      <div class='row logrow'>
        <div class='col-10 my-1'>
          <span class='desc-tag resource-icon bg-energy p-1 icon-energy' style="vertical-align:top;">
          ${setting.icon.energy}
          </span> 
          <div style="position:relative;display:inline-block;vertical-align:top;width:40px;height:34px;">
            <div class="arrow">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <span class='desc-tag resource-icon bg-heat p-1 icon-heat' style="vertical-align:top;">
            ${setting.icon.heat}
          </span>
        </div>
      <div class='col-2 text-right py-2'>  ${historyLog[i]["value"]}</div>
    </div>`)
    }
    else if (historyLog[i]["type"] == "TR") {
      $("#history").append(`
      <div class='row logrow'>
        <div class='col-10 my-1 py-2'>Terraforming Rating</div>
        <div class='col-2 text-right py-2'> ${actionType} ${historyLog[i]["value"]}</div>
      </div>`)
    }
    else {
      let _class = `<div class='resource-icon bg-${historyLog[i]["resource"]}  icon-${historyLog[i]["resource"]}'>${setting.icon[historyLog[i]["resource"]]}</div>`
      if (historyLog[i]["type"] == "production") {
        // _class = "text-" + historyLog[i]["resource"]
        _class = `<div class='production-icon xs'> ${_class} </div>`
      }
      // else if (historyLog[i]["type"] == "resources") {
      //   _class = "icon-" + historyLog[i]["resource"] + " bg-" + historyLog[i]["resource"]
      // }


      let str = `
      <div class='row logrow'>
        <div class='col-10 my-1'> ${_class} </div>
        <div class='col-2  ${historyLog[i]["action"]} text-right py-2'> ${actionType} ${historyLog[i]["value"]} </div>
      </div>`
      $("#history").append(str)
    }
  }

  saveToLocal()
}

function nextGen() {
  game["generation"]++
  // $("#generation").val(game["generation"])

  transferEnergy()

  let goldResource = game["terraRating"] + game["production"]["gold"]
  plus("gold", goldResource, "resources", { noLog: true })
  plus("steel", game["production"]["steel"], "resources", { noLog: true })
  plus("titanium", game["production"]["titanium"], "resources", { noLog: true })
  plus("plant", game["production"]["plant"], "resources", { noLog: true })
  plus("energy", game["production"]["energy"], "resources", { noLog: true })
  plus("heat", game["production"]["heat"], "resources", { noLog: true })
  historyLog.push({ type: "generation", value: game["generation"] - 1 })
  populateHistory()

}

function addTR(options) {
  console.log("addTR")
  let opt = Object.assign({}, options)
  let clearUndoTrack = opt.clearUndoTrack == false ? false : true
  let tr = parseInt($("#terraRating").val()) + 1
  console.log(tr)
  game["terraRating"] = tr
  if (opt && opt.noLog !== true) {
    historyLog.push({ type: "TR", action: "plus", resource: "terraRating", value: 1, gen: game["generation"] })
    populateHistory()
  }

  renderGameState(clearUndoTrack)
}

function minusTR(options) {
  let tr = parseInt($("#terraRating").val()) - 1
  let opt = Object.assign({}, options)
  let clearUndoTrack = opt.clearUndoTrack == false ? false : true

  game["terraRating"] = tr
  if (opt && opt.noLog !== true) {
    historyLog.push({ type: "TR", action: "minus", resource: "terraRating", value: 1, gen: game["generation"] })
    populateHistory()
  }
  renderGameState(clearUndoTrack)

}

function undo() {
  let lastAction = historyLog.pop()
  if (!lastAction) {
    return
  }
  undoTrack.push(lastAction)
  if (lastAction.type == "generation") {
    let resources = Object.keys(game.resources)
    resources.forEach(e => {
      game.resources[e] = game.resources[e] - game.production[e]
    })
    game.generation--
    game.resources.gold = game.resources.gold - game.terraRating
    undo()
  } else if (lastAction.type == "production" || lastAction.type == "resources") {
    if (lastAction.action == "plus") {
      minus(lastAction.resource, lastAction.value, lastAction.type, { noLog: true, clearUndoTrack: false })
    } else {
      plus(lastAction.resource, lastAction.value, lastAction.type, { noLog: true, clearUndoTrack: false })
    }
  } else if (lastAction.type == "TR") {
    if (lastAction.action == "plus") {
      minusTR({ noLog: true, clearUndoTrack: false })
    } else {
      addTR({ noLog: true, clearUndoTrack: false })
    }
  } else if (lastAction.type == "transferEnergy") {
    game.resources.heat = game.resources.heat - lastAction.value
    game.resources.energy = lastAction.value
  } else {

  }


  populateHistory()
  renderGameState(false)
}

function redo() {
  let lastAction = undoTrack.pop()
  if (!lastAction) {
    return
  }
  historyLog.push(lastAction)
  if (lastAction.type == "generation") {
    let resources = Object.keys(game.resources)
    resources.forEach(e => {
      game.resources[e] = game.resources[e] + game.production[e]
    })
    game.generation++
    game.resources.gold = game.resources.gold + game.terraRating
  } else if (lastAction.type == "production" || lastAction.type == "resources") {
    if (lastAction.action == "plus") {
      plus(lastAction.resource, lastAction.value, lastAction.type, { noLog: true, clearUndoTrack: false })
    } else {
      minus(lastAction.resource, lastAction.value, lastAction.type, { noLog: true, clearUndoTrack: false })
    }
  } else if (lastAction.type == "TR") {
    if (lastAction.action == "plus") {
      addTR({ noLog: true, clearUndoTrack: false })
    } else {
      minusTR({ noLog: true, clearUndoTrack: false })
    }
  } else if (lastAction.type == "transferEnergy") {
    game.resources.heat = game.resources.heat + lastAction.value
    game.resources.energy = lastAction.value
    redo()
  } else {

  }


  populateHistory()
  renderGameState(false)
}

function renderGameState(clearUndoTrack) {
  console.log("rendering game state")
  $("#terraRating").val(game["terraRating"])
  let productions = Object.keys(game.production)
  let resources = Object.keys(game.resources)
  productions.forEach(e => {
    $(".production." + e).html(game.production[e])
  })
  resources.forEach(e => {
    $(".resources." + e).html(game.resources[e])
  })
  $("#generation").val(game["generation"])

  if (clearUndoTrack === true) {
    undoTrack = []
  }
  if (undoTrack.length == 0) {
    $("#redoBtn").prop("disabled", true)
    $("#redoBtn").addClass("btn-outline-warning")
    $("#redoBtn").removeClass("btn-warning")
  } else {
    $("#redoBtn").prop("disabled", false)
    $("#redoBtn").addClass("btn-warning")
    $("#redoBtn").removeClass("btn-outline-warning")
  }
  if (historyLog.length == 0) {
    $("#undoBtn").prop("disabled", true)
    $("#undoBtn").addClass("btn-outline-warning")
    $("#undoBtn").removeClass("btn-warning")
  } else {
    $("#undoBtn").prop("disabled", false)
    $("#undoBtn").addClass("btn-warning")
    $("#undoBtn").removeClass("btn-outline-warning")
  }
}

function changeTR(tr) {
  tr = parseInt(tr)
  terraRating = tr
}

function resetGame() {
  game = {
    resources: {
      gold: 0,
      steel: 0,
      titanium: 0,
      plant: 0,
      energy: 0,
      heat: 0
    },
    production: {
      gold: 0,
      steel: 0,
      titanium: 0,
      plant: 0,
      energy: 0,
      heat: 0
    },
    generation: 1,
    terraRating: 20
  }

  historyLog = []

  populateHistory()
  renderGameState(true)
  // $("#generation").val("1")
  // $("#terraRating").val("20")
  // let _resources = Object.keys(game["resources"])
  // for (var i = 0; i < _resources.length; i++) {
  //   $(".resources." + _resources[i]).html("0")
  //   $(".production." + _resources[i]).html("0")
  // }

}

function handleTouchStart(e) {
  if ($(e.target).closest(".production-bar").length > 0) {
    console.log($(e.target).closest(".production-bar")[0].id)
    setting.touch.x = e.touches[0].clientX;
    setting.touch.y = e.touches[0].clientY;
    setting.touch.lastX = e.touches[0].clientX;
    setting.touch.lastY = e.touches[0].clientY;
  }

}

function handleTouchMove(e) {
  if ($(e.target).closest(".production-bar").length > 0) {

    if (!setting.touch.x || !setting.touch.y) {
      return;
    }
    var xUp = e.touches[0].clientX;
    var yUp = e.touches[0].clientY;
    var xDiff = setting.touch.x - xUp;
    var yDiff = setting.touch.y - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {/*most significant*/
      if (xDiff > 0) {
        /* left swipe */
        setting.touch.swipe = "left"
      } else {
        /* right swipe */
        setting.touch.swipe = "right"

      }
    } else {
      if (yDiff > 0) {
        /* up swipe */
        setting.touch.swipe = "up"

      } else {
        /* down swipe */
        setting.touch.swipe = "down"

      }
    }
    /* reset values */
    setting.touch.x = null;
    setting.touch.y = null;

  }
}

function handleTouchEnd(e) {
  if ($(e.target).closest(".production-bar").length > 0) {
    let resourceType = $(e.target).closest(".production-bar")[0].id
    console.log(setting.touch.swipe)
    if (setting.touch.swipe == "left") {
      minus(resourceType, 1, "production")
    }
    else if (setting.touch.swipe == "right") {
      plus(resourceType, 1, "production")

    }
  }
  setting.touch.swipe = null
  setting.touch.x = null;
  setting.touch.y = null;

}

$(document).on("touchstart", handleTouchStart)
$(document).on("touchmove", handleTouchMove)
$(document).on("touchend", handleTouchEnd)

function openCalculator(resource) {
  setting.calculator.resource = resource
  $("#calculatorModal").modal("show")
}

$("#calculatorModal .num").on("click", function (e) {
  if (e.target.dataset.num) {
    if (setting.calculator.num == "0") {
      setting.calculator.num = ""
    }
    setting.calculator.num += e.target.dataset.num
  }
  console.log(setting.calculator.num)
  $(".displayNum").html(setting.calculator.num)
})

$("#calculatorModal .submit").on("click", function (e) {
  let action = $(e.target).closest(".submit")[0].dataset.action
  let num = parseInt(setting.calculator.num)
  let resourceType = setting.calculator.resource
  if (action == "plus") {
    plus(resourceType, num, "resources")
  }
  else {
    minus(resourceType, num, "resources")
  }
  console.log(action, num, resourceType)

  $("#calculatorModal").modal("hide")
  setting.calculator.num = 0
  $(".displayNum").html("0")


})

$("#calculatorModal .clear").on("click", function (e) {
  setting.calculator.num = 0
  $(".displayNum").html("0")
  console.log("clear", setting.calculator.num)
})

function saveToLocal() {
  if (typeof (Storage) !== "undefined") {
    localStorage["game"] = JSON.stringify(game)
    localStorage["historyLog"] = JSON.stringify(historyLog)
  } else {
    console.log("local storagenot supported")
  }
}

function loadFromLocal() {
  if (typeof (Storage) !== "undefined") {
    let loadedGame = localStorage["game"]
    if (loadedGame) {
      loadedGame = JSON.parse(localStorage["game"])
      let resources = Object.keys(game["resources"])
      for (var i = 0; i < resources.length; i++) {
        game["resources"][resources[i]] = loadedGame["resources"][resources[i]]
        // $(".resources." + resources[i]).html(loadedGame["resources"][resources[i]])
        game["production"][resources[i]] = loadedGame["production"][resources[i]]
        // $(".production." + resources[i]).html(loadedGame["production"][resources[i]])
      }

      game.generation = loadedGame["generation"]
      // $("#generation").val(loadedGame["generation"])

      game.terraRating = loadedGame["terraRating"]
      // $("#terraRating").val(loadedGame["terraRating"])
    }

    let loadedHistoryLog = localStorage["historyLog"]
    if (loadedHistoryLog) {
      loadedHistoryLog = JSON.parse(localStorage["historyLog"])
      historyLog = loadedHistoryLog
    }
    renderGameState(false)
    populateHistory()
  } else {
    console.log("local storage not supported")
  }
}