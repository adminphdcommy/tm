let setting = {
  img: {
    gold: 0,
    steel: 0,
    titanium: 0,
    plant: 0,
    energy: 0,
    heat: 0
  }
}

let generation = 0
let terraRating = 20

let resources = {
  gold: 0,
  steel: 0,
  titanium: 0,
  plant: 0,
  energy: 0,
  heat: 0
}


let production = {
  gold: 0,
  steel: 0,
  titanium: 0,
  plant: 0,
  energy: 0,
  heat: 0
}

let historyLog = []

function plusResources(type, value) {
  resources[type] += value
  historyLog.push({ type: "resources", action: "plus", resource: type, value: value, gen: generation })
  $(".resources." + type).html(resources[type])
  populateHistory()


}

function plusProduction(type, value) {
  production[type] += value
  historyLog.push({ type: "production", action: "plus", resource: type, value: value, gen: generation })
  $(".production." + type).html(production[type])

  populateHistory()

}

function minusResources(type, value) {
  if (resources[type] > 0) {
    resources[type] -= value
    historyLog.push({ type: "resources", action: "minus", resource: type, value: value, gen: generation })
    $(".resources." + type).html(resources[type])

    populateHistory()
  }
  else {
    alert("insufficient " + type + " resources")

  }

}

function minusProduction(type, value) {
  if (production[type] > 0) {

    production[type] -= value
    historyLog.push({ type: "production", action: "minus", resource: type, value: -value, gen: generation })
    $(".production." + type).html(production[type])

    populateHistory()
  }
  else if (production[type] <= 0 && type == "gold" && production[type] > -5) {
    production[type]--
    historyLog.push({ type: "production", action: "minus", resource: type, value: -value, gen: generation })
    $(".production." + type).html(production[type])
  }
  else {
    alert("insufficient " + type + " production")

  }
}

function populateHistory() {
  $("#history").html("")
  for (var i = historyLog.length - 1; i >= 0; i--) {
    if (historyLog[i]["type"] == "generation") {
      $("#history").append("<div class='logrow'>--New Gen : " + historyLog[i]["value"] + "--</div>")
    }
    else {
      let str = ""
      str = str + "G" + historyLog[i]["gen"] + " : " + historyLog[i]["resource"] + " " + historyLog[i]["type"] + " " + historyLog[i]["action"] + " " + historyLog[i]["value"]
      $("#history").append("<div class='logrow'>" + str + "</div>")
    }

  }
}

function nextGen() {
  generation++
  $("#generation").html(generation)
  let goldResource = terraRating + production["gold"]
  console.log(goldResource)
  plusResources("gold", goldResource)
  plusResources("steel", production["steel"])
  plusResources("titanium", production["titanium"])
  plusResources("plant", production["plant"])
  plusResources("energy", production["energy"])
  plusResources("heat", production["heat"])
  historyLog.push({ type: "generation", value: generation })
  populateHistory()
}

function changeTR(tr){
  tr = parseInt(tr)
  terraRating = tr
}