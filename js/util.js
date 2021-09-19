

(function () {
    let adjustRequestCount = 0
    let adjustRequestedCount = 0
    var _publicUtil = {
        yyyyMMddHHmmSS: function (timestamp) {
            let date = new Date(timestamp)
            let year = date.getFullYear()
            let month = date.getMonth() + 1
            let day = date.getDate()
            if (day < 10) {
                day = "0" + day
            }


            let formattedDate = year + "-" + month + "-" + day + " " + this.hhMMss(timestamp)
            return formattedDate
        },
        yyyyMMdd: function (timestamp) {
            let date = new Date(timestamp)
            let year = date.getFullYear()
            let month = date.getMonth() + 1
            let day = date.getDate()
            if (day < 10) {
                day = "0" + day
            }
            if (month < 10) {
                month = "0" + month
            }


            let formattedDate = year + "-" + month + "-" + day
            return formattedDate
        },
        hhMMss: function (timestamp) {
            let date = new Date(timestamp)
            let hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours()
            let minute = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()
            let seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()

            let formattedDate = hour + ":" + minute + ":" + seconds
            return formattedDate
        },
        todayHHmmSS: function (timestamp) {
            let date = new Date(timestamp)
            let dateNow = new Date(Date.now())
            if (date.getDay() !== dateNow.getDay()) {
                return _publicUtil.date.getDayString(date.getDay(), { short: true })
            }
            else {
                return _publicUtil.hhMMss(timestamp)
            }
        },
        /**
         * 
         * @param {Number} timestamp 
         * @param {{hour:boolean,min:boolean,sec:boolean}} option 
         */
        remainingTime: function (timestamp, option) {
            let hour = Math.floor((timestamp % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let min = Math.floor((timestamp % (1000 * 60 * 60)) / (1000 * 60));
            let sec = Math.floor((timestamp % (1000 * 60)) / 1000);
            if (hour < 10) {
                hour = "0" + hour
            }
            if (min < 10) {
                min = "0" + min
            }
            if (sec < 10) {
                sec = "0" + sec
            }
            let formattedDate = `${hour}:${min}:${sec}`
            return formattedDate
        },
        date: {
            /**
             * 
             * @param {Number} num 
             * @param {Object} option 
             * @param {Boolean} option.short 
             * @param {Boolean} option.cap 
             * @param {Boolean} option.low 
             */
            getDayString: function (num, option) {
                let map = {
                    0: "Sunday",
                    1: "Monday",
                    2: "Tuesday",
                    3: "Wednesday",
                    4: "Thursday",
                    5: "Friday",
                    6: "Saturday"
                }
                let result = map[num]
                if (option.short) {
                    result = result.substring(0, 3)
                }
                if (option.cap) {
                    result = result.toUpperCase()
                }
                if (option.low) {
                    result = result.toLowerCase()
                }
                return result
            },
            /**
             * 
             * @param {Number} Str 
             * @returns {undefined|Number}
             */
            getDayNumByString: function (str) {
                let map = [
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday"
                ]
                let index = undefined
                map.map((day,i) =>{
                    day2 = _publicUtil.date.getDayString(i,{low:true,short:true})
                    if(day2 == str){
                        index = i
                    }
                })
            
                return index
            },
            /**
             * 
             * @param {Number} num 
             * @param {Object} option 
             * @param {Boolean} option.short 
             * @param {Boolean} option.cap 
             * @param {Boolean} option.low 
             */
             getMonthString: function (num, option) {
                let map = {
                    0: "January",
                    1: "February",
                    2: "March",
                    3: "April",
                    4: "May",
                    5: "June",
                    6: "July",
                    7: "August",
                    8: "September",
                    9: "October",
                    10: "November",
                    11: "December"
                }
                let result = map[num]
                if (option.short) {
                    result = result.substring(0, 3)
                }
                if (option.cap) {
                    result = result.toUpperCase()
                }
                if (option.low) {
                    result = result.toLowerCase()
                }
                return result
            },
            today: function () {
                let today = Date.now()
                today = _publicUtil.yyyyMMdd(today)
                return today
            }
        },

        /**
         * 
         * @param {Boolean} command True || False
         * @param {Number} timeout True || False
         */
        overlay: function (command, timeout) {
            let description = ""
            let html = '<div id="defaultOverlay" style="overflow-y:hidden;z-index: 10000;height: 100%;position: fixed;top: 0;left:0;right:0;bottom:0;width: 100%;">    <div style="background-color: darkgray;height: 100%;opacity: 0.4;top: 0;width: 100%;"></div>    <div class="d-flex justify-content-center" style="top: 45%;position: absolute;width:100%"><div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div></div><div id="overLayDesc" style="top:50%;width:100%;position: absolute;text-align:center">' + description + '</div></div>'
            let _default_method_ = {
                on: function (ms) {
                    TO = ms || 0
                    if (!$("#defaultOverlay").length) {
                        $("body").append(html)
                    }
                    setTimeout(() => {
                        $("#defaultOverlay").show()
                        $("body").css("overflow-y", "hidden")
                    }, TO);
                },
                off: function (ms) {
                    TO = ms || 0
                    setTimeout(() => {
                        $("#defaultOverlay").hide()
                        $("body").css("overflow-y", "initial")
                    }, TO);
                },
            }

            if (command == true) {
                _default_method_.on(timeout)
            } else if (command == false) {
                _default_method_.off(timeout)
            }
            else {

            }
            this.desc = function (text) {
                $("#overLayDesc").html(text.trim())
                return this
            }

            return this
        },

        /**
         * 
         * @param {Number} lastFor ms
         * @param {String} status success || danger
         */
        pop: function (lastFor, status) {
            lastFor = lastFor || 1000
            $("#popAlert").hide()
            let description = ""
            let borderColor = ""
            let textColor = ""



            let html = '<div id="popAlert" style="position:fixed;top:45%;left: 0%; z-index: 100; padding: 5px 10px;text-align: center;width: 100%;    "><span id="popAlertDesc" style="display: inline-block; padding: 5px 10px;background-color: whitesmoke;border-radius:6px; border:1px solid #d8bbbb;color:#bb0000">' + description + '</span></div>'


            if (!$("#popAlert").length) {
                $("body").append(html)
            }

            if (status == "success") {
                textColor = "#128636"
                borderColor = "#14923b"
            } else if (status == "danger") {
                textColor = "#bb0000"
                borderColor = "#bf2525"

            }
            else {
                textColor = "#0c5460"
                borderColor = "#bee5eb"
            }
            $("#popAlertDesc").css("border-color", borderColor)
            $("#popAlertDesc").css("color", textColor)


            // $(window).on("click",clickOutsideToRemovePop)

            function clickOutsideToRemovePop(e) {
                console.log(e.target.id)
                if (e.target.id !== "popAlert" && e.target.id !== "popAlertDesc") {
                    removePop()
                }
                $(window).off("click", clickOutsideToRemovePop)
            }

            function removePop() {
                $("#popAlert").fadeOut(200)

            }

            this.desc = function (text) {
                $("#popAlertDesc").html(text.trim())
                return this
            }

            this.remove = function () {
                removePop()
            }

            $("#popAlert").fadeIn(200, function () {
                setTimeout(() => {
                    removePop()
                }, lastFor);
            })

            return this
        },
        url: {
            /**
             * @param {String} param URL Param key
             */
            get: function (param) {
                var url_string = window.location.href
                var url = new URL(url_string);
                var val = url.searchParams.get(param);
                return val
            }
        },

        /**
         * 
         * @param {Object} requirements {length:number}
         * @param {Number} requirements.length
         * Default 50 length
         */
        idGenerator: function (requirements) {
            requirements = requirements ? requirements : {}

            let charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890abcdefghijklmnopqrstuvwxyz"
            let id = ""
            let length = requirements.length || 50
            for (var i = 0, n = charset.length; i < length; i++) {
                id += charset.charAt(Math.floor(Math.random() * n));
            }
            return id;
        },


    }


    if (!window.util && !window["$util"]) {
        return window["util"] = _publicUtil
    }
    else if (window.util && !window["$util"]) {
        alert("util library conflict, use '$util' variable instead ")
        return window["$util"] = _publicUtil
    } else {
        alert("util library conflict, use '$customPutil' variable instead ")
        return window["$customPutil"] = _publicUtil
    }
})()




