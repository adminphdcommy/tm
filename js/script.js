
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

let historyLog = []

initialize()

function initialize() {
  loadFromLocal()
}


function plus(resourceType, value, section, options) {
  let opts = Object.assign({}, options)
  if (section == 'resources' || section == 'production') {
    game[section][resourceType] += value
    $("." + section + "." + resourceType).html(game[section][resourceType])

    if (opts["noLog"]) {
      return false
    }
    historyLog.push({ type: section, action: "plus", resource: resourceType, value: value, gen: game["generation"] })
  }
  else if (section == "terraRating") {
    game[section] += value
  }

  populateHistory()

}

function minus(resourceType, value, section, options) {
  let opts = Object.assign({}, options)
  if (section == 'resources') {
    if (game[section][resourceType] >= value || value == 0) {
      game[section][resourceType] -= value
      $(".resources." + resourceType).html(game[section][resourceType])

      if (opts["noLog"]) {
        return false
      }
      historyLog.push({ type: section, action: "minus", resource: resourceType, value: value, gen: game["generation"] })

    }
    else {
      return alert("insufficient " + resourceType + " resources")
    }
  }
  else if (section == 'production') {
    if (game[section][resourceType] > 0) {
      game[section][resourceType] -= value
      $(".production." + resourceType).html(game[section][resourceType])

      if (opts["noLog"]) {
        return false
      }
      historyLog.push({ type: "production", action: "minus", resource: resourceType, value: value, gen: game["generation"] })


    }
    else if (game[section][resourceType] <= 0 && resourceType == "gold" && game[section][resourceType] > -5) {
      game[section][resourceType]--
      $(".production." + resourceType).html(game[section][resourceType])

      if (opts["noLog"]) {
        return false
      }
      historyLog.push({ type: "production", action: "minus", resource: resourceType, value: value, gen: game["generation"] })

    }
    else {
      return alert("insufficient " + resourceType + " production")

    }
  }

  populateHistory()


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
      $("#history").append("<div class='col'><h5 class='text-center my-3'>Generation " + actionType + historyLog[i]["value"] + "</h5></div>")
    }
    else if (historyLog[i]["type"] == "transferEnergy") {
      $("#history").append("<div class='row'><div class='col-10 my-1'><span class='desc-tag bg-energy p-1'>Energy</span> --> <span class='desc-tag bg-heat p-1'>Heat</span></div><div class='col-2'> " + historyLog[i]["value"] + "</div></div>")
    }
    else if (historyLog[i]["type"] == "TR") {
      $("#history").append("<div class='row'><div class='col-10 my-1'>Terraforming Rating</div><div class='col-2'> " + actionType + historyLog[i]["value"] + "</div></div>")
    }
    else {
      let _class = "<div class='resource-icon bg-" + historyLog[i]["resource"] + " icon-" + historyLog[i]["resource"] + "'>" + setting.icon[historyLog[i]["resource"]] + "</div>"
      if (historyLog[i]["type"] == "production") {
        // _class = "text-" + historyLog[i]["resource"]
        _class = "<div class='production-icon xs'>" + _class + "</div>"
      }
      // else if (historyLog[i]["type"] == "resources") {
      //   _class = "icon-" + historyLog[i]["resource"] + " bg-" + historyLog[i]["resource"]
      // }


      let str = "<div class='row logrow'><div class='col-10 my-1'>" + _class + "</div><div class='col-2 " + historyLog[i]["action"] + "'>" + actionType + historyLog[i]["value"] + "</div></div>"
      // str = str + historyLog[i]["resource"] + " " + historyLog[i]["type"] + " " + historyLog[i]["action"] + " " + historyLog[i]["value"]
      $("#history").append(str)
    }
  }

  saveToLocal()
}

function nextGen() {
  game["generation"]++
  $("#generation").val(game["generation"])

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

function addTR() {
  console.log("addTR")
  let tr = parseInt($("#terraRating").val()) + 1
  console.log(tr)
  $("#terraRating").val(tr)
  game["terraRating"] = tr
  historyLog.push({ type: "TR", action: "plus", resource: "terraRating", value: 1, gen: game["generation"] })
  populateHistory()

}

function minusTR() {
  let tr = parseInt($("#terraRating").val()) - 1
  $("#terraRating").val(tr)
  game["terraRating"] = tr
  historyLog.push({ type: "TR", action: "minus", resource: "terraRating", value: 1, gen: game["generation"] })
  populateHistory()


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
  $("#generation").val("1")
  $("#terraRating").val("20")
  let _resources = Object.keys(game["resources"])
  for (var i = 0; i < _resources.length; i++) {
    $(".resources." + _resources[i]).html("0")
    $(".production." + _resources[i]).html("0")
  }

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
        $(".resources." + resources[i]).html(loadedGame["resources"][resources[i]])
        game["production"][resources[i]] = loadedGame["production"][resources[i]]
        $(".production." + resources[i]).html(loadedGame["production"][resources[i]])
      }

      game.generation = loadedGame["generation"]
      $("#generation").val(loadedGame["generation"])

      game.generation = loadedGame["terraRating"]
      $("#terraRating").val(loadedGame["terraRating"]) 
    }

    let loadedHistoryLog = localStorage["historyLog"]
    if(loadedHistoryLog){
      loadedHistoryLog = JSON.parse(localStorage["historyLog"])
      historyLog = loadedHistoryLog
    }

  } else {
    console.log("local storage not supported")
  }
}