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

function plus(resourceType, value, section, genHistory) {
  if (section == 'resources' || section == 'production') {
    game[section][resourceType] += value
    historyLog.push({ type: section, action: "plus", resource: resourceType, value: value, gen: game["generation"] })
    $("." + section + "." + resourceType).html(game[section][resourceType])
  }
  else if (section == "terraRating") {
    game[section] += value
  }

  if (!genHistory) {
    populateHistory()
  }

}

function minus(resourceType, value, section) {
  if (section == 'resources') {
    if (game[section][resourceType] > 0 || value ==0) {
      game[section][resourceType] -= value
      historyLog.push({ type: section, action: "minus", resource: resourceType, value: value, gen: game["generation"] })
      $(".resources." + resourceType).html(game[section][resourceType])
    }
    else {
      return alert("insufficient " + resourceType + " resources")
    }
  }
  else if (section == 'production') {
    if (game[section][resourceType] > 0) {
      game[section][resourceType] -= value
      historyLog.push({ type: "production", action: "minus", resource: resourceType, value: value, gen: game["generation"] })
      $(".production." + resourceType).html(game[section][resourceType])

    }
    else if (game[section][resourceType] <= 0 && resourceType == "gold" && game[section][resourceType] > -5) {
      game[section][resourceType]--
      historyLog.push({ type: "production", action: "minus", resource: resourceType, value: value, gen: game["generation"] })
      $(".production." + resourceType).html(game[section][resourceType])
    }
    else {
      return alert("insufficient " + resourceType + " production")

    }
  }

  populateHistory()


}



function populateHistory() {
  $("#history").html("")
  for (var i = historyLog.length - 1; i >= 0; i--) {
    if (historyLog[i]["type"] == "generation") {
      $("#history").append("<div class='col'><h5 class='text-center my-3'>Generation " + historyLog[i]["value"] + "</h5></div>")
    }
    else {
      let _class
      if (historyLog[i]["type"] == "production") {
        _class = "text-"
      }
      else if (historyLog[i]["type"] == "resources") {
        _class = "bg-"
      }


      let str = "<div class='row logrow'><div class='col-10'>" + " <span class='" + _class + historyLog[i]["resource"]+"'>" + historyLog[i]["resource"] + "</span></div><div class='col-2 " + historyLog[i]["action"] + "'>" + historyLog[i]["value"] + "</div></div>"
      // str = str + historyLog[i]["resource"] + " " + historyLog[i]["type"] + " " + historyLog[i]["action"] + " " + historyLog[i]["value"]
      $("#history").append(str)
    }

  }
}

function nextGen() {
  game["generation"]++
  $("#generation").val(game["generation"])

  plus("heat", game["resources"]["energy"], "resources", false)
  minus("energy", game["resources"]["energy"], "resources", false)

  let goldResource = game["terraRating"] + game["production"]["gold"]
  plus("gold", goldResource, "resources", false)
  plus("steel", game["production"]["steel"], "resources", false)
  plus("titanium", game["production"]["titanium"], "resources", false)
  plus("plant", game["production"]["plant"], "resources", false)
  plus("energy", game["production"]["energy"], "resources", false)
  plus("heat", game["production"]["heat"], "resources", false)
  historyLog.push({ type: "generation", value: game["generation"] - 1 })
  populateHistory()
}

function changeTR(tr) {
  tr = parseInt(tr)
  terraRating = tr
}